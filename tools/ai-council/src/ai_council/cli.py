"""User-facing AI Council command line interface."""

from __future__ import annotations

import importlib.metadata
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import typer
from rich.console import Console

from ai_council.config import find_repo_root, load_config
from ai_council.progress import STAGE_LABELS, TerminalProgress, friendly_error
from ai_council.runtime import CouncilRuntime


app = typer.Typer(
    name="ai-council",
    help="Controlled Codex + Claude/GLM workflow with optional CrewAI deep review.",
    no_args_is_help=True,
)


@app.command()
def doctor() -> None:
    """Check local runtimes without making model calls."""
    repo_root = find_repo_root()
    config = load_config(repo_root)
    checks = {
        "Repository": str(repo_root),
        "Python": sys.version.split()[0],
        "Codex": _command_version(config.codex.executable, "--version"),
        "Claude Code": _command_version(config.claude.executable, "--version"),
        "Git": _command_version("git", "--version"),
        "Node": _command_version("node", "--version"),
        "npm": _command_version("npm", "--version"),
        "LangGraph": _package_version("langgraph"),
        "CrewAI": _package_version("crewai"),
    }
    failed = False
    for name, value in checks.items():
        ok = not value.startswith("MISSING")
        failed = failed or not ok
        typer.echo(f"{'OK' if ok else 'FAIL':4}  {name}: {value}")
    runtime_dir = repo_root / config.runtime.directory
    typer.echo(f"OK    Local state: {runtime_dir} (git-ignored)")
    if failed:
        raise typer.Exit(code=1)


@app.command()
def start(
    task: str = typer.Argument(..., help="Task for the council"),
    deep_review: bool = typer.Option(False, "--deep-review", help="Run CrewAI experts"),
    dry_run: bool = typer.Option(False, "--dry-run", help="Use no model calls or project checks"),
) -> None:
    """Create a run and stop at the mandatory plan approval gate."""
    progress = TerminalProgress()
    try:
        with progress, CouncilRuntime(progress=progress) as runtime:
            run_id, state = runtime.start(task, deep_review=deep_review, dry_run=dry_run)
    except Exception as exc:
        _exit_with_error(exc, progress.run_id)
    _print_state(state, include_plan=True)
    prefix = "uv run --project tools/ai-council ai-council"
    typer.echo(f"\nApprove: {prefix} approve {run_id}")
    typer.echo(f"Reject:  {prefix} reject {run_id} --reason \"...\"")


@app.command()
def approve(
    run_id: str = typer.Argument(...),
    reason: str = typer.Option("Approved by user", "--reason"),
) -> None:
    """Approve a plan and continue implementation through review."""
    progress = TerminalProgress()
    try:
        with progress, CouncilRuntime(progress=progress) as runtime:
            state = runtime.decide(run_id, approved=True, reason=reason)
    except Exception as exc:
        _exit_with_error(exc, run_id)
    _print_state(state)


@app.command()
def reject(
    run_id: str = typer.Argument(...),
    reason: str = typer.Option(..., "--reason", help="Why the plan was rejected"),
) -> None:
    """Reject a pending plan without changing project files."""
    try:
        with CouncilRuntime() as runtime:
            state = runtime.decide(run_id, approved=False, reason=reason)
    except Exception as exc:
        _exit_with_error(exc, run_id)
    _print_state(state)


@app.command()
def status(run_id: str = typer.Argument(...)) -> None:
    """Show the latest durable state for a run."""
    with CouncilRuntime() as runtime:
        state = runtime.state(run_id)
    _print_state(state, include_plan=True)


@app.command()
def history(run_id: str = typer.Argument(...)) -> None:
    """Show checkpoint history, newest first."""
    with CouncilRuntime() as runtime:
        entries = runtime.history(run_id)
    typer.echo(json.dumps(entries, ensure_ascii=False, indent=2))


@app.command()
def resume(run_id: str = typer.Argument(...)) -> None:
    """Retry the next node after a recoverable failure."""
    progress = TerminalProgress()
    try:
        with progress, CouncilRuntime(progress=progress) as runtime:
            state = runtime.resume(run_id)
    except Exception as exc:
        _exit_with_error(exc, run_id)
    _print_state(state)


@app.command()
def watch(
    run_id: str = typer.Argument(...),
    interval: float = typer.Option(2.0, "--interval", min=0.5, max=30.0),
) -> None:
    """Follow audit events and durable state from another terminal."""
    repo_root = find_repo_root()
    config = load_config(repo_root)
    audit_path = repo_root / config.runtime.directory / config.runtime.audit_log
    console = Console()
    console.print(f"[bold]Run izleniyor:[/bold] {run_id}  [dim](Ctrl+C ile çık)[/dim]")
    position = 0
    last_heartbeat = 0.0
    saw_failure = False
    try:
        with CouncilRuntime(repo_root) as runtime:
            while True:
                position, events = _read_audit_events(audit_path, run_id, position)
                for event in events:
                    _print_watch_event(console, event)
                    saw_failure = saw_failure or event.get("event") in {
                        "stage_failed",
                        "run_error",
                    }
                try:
                    state = runtime.state(run_id)
                except RuntimeError:
                    state = {"status": "starting", "next_nodes": []}

                status_value = state.get("status")
                if saw_failure:
                    console.print(
                        f"[red]Çalışma hata nedeniyle durdu.[/red] Devam: {_command_prefix()} resume {run_id}"
                    )
                    raise typer.Exit(code=1)
                if status_value in {"completed", "rejected", "blocked", "failed"}:
                    _print_state(state)
                    return
                if status_value == "awaiting_approval":
                    _print_state(state, include_plan=True)
                    return

                now = time.monotonic()
                if now - last_heartbeat >= 10:
                    next_nodes = ", ".join(state.get("next_nodes", [])) or "başlatılıyor"
                    console.print(f"[dim]… çalışıyor; sonraki düğüm: {next_nodes}[/dim]")
                    last_heartbeat = now
                time.sleep(interval)
    except KeyboardInterrupt:
        console.print("\nİzleme durduruldu; ana çalışma etkilenmedi.")


def _print_state(state: dict, *, include_plan: bool = False) -> None:
    typer.echo(f"Status: {state.get('status', 'unknown')}")
    typer.echo(f"Next: {', '.join(state.get('next_nodes', [])) or 'none'}")
    typer.echo(f"Review round: {state.get('review_round', 0)}")
    if include_plan and state.get("plan"):
        typer.echo("\nPlan:")
        typer.echo(json.dumps(state["plan"], ensure_ascii=False, indent=2))
    if include_plan and state.get("crew_report"):
        typer.echo("\nCrewAI expert report:")
        typer.echo(json.dumps(state["crew_report"], ensure_ascii=False, indent=2))
    verification = state.get("verification")
    if verification:
        typer.echo(f"Verification: {'passed' if verification.get('ok') else 'failed'}")
    review = state.get("review")
    if review:
        typer.echo(f"GLM review: {'approved' if review.get('approved') else 'changes requested'}")
        typer.echo(review.get("summary", ""))
    if state.get("final_report"):
        typer.echo(f"Result: {state['final_report']}")


def _command_version(executable: str, flag: str) -> str:
    path = shutil.which(executable)
    if not path:
        return f"MISSING ({executable})"
    completed = subprocess.run(
        [path, flag], text=True, capture_output=True, timeout=10, check=False
    )
    if completed.returncode != 0:
        return f"MISSING ({completed.stderr.strip() or 'version check failed'})"
    return (completed.stdout or completed.stderr).strip().splitlines()[0]


def _package_version(name: str) -> str:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:
        return f"MISSING ({name})"


def _exit_with_error(error: Exception, run_id: str | None) -> None:
    if os.getenv("AI_COUNCIL_DEBUG") == "1":
        raise error
    typer.secho(f"Hata: {friendly_error(error)}", fg=typer.colors.RED, err=True)
    if run_id and not str(error).startswith("Unknown run:"):
        typer.echo(f"Run ID: {run_id}", err=True)
        typer.echo(f"Devam: {_command_prefix()} resume {run_id}", err=True)
        typer.echo(f"İzle: {_command_prefix()} watch {run_id}", err=True)
    typer.echo("Ayrıntılı traceback: AI_COUNCIL_DEBUG=1 ile komutu tekrarlayın.", err=True)
    raise typer.Exit(code=1)


def _command_prefix() -> str:
    return "uv run --project tools/ai-council ai-council"


def _read_audit_events(path: Path, run_id: str, position: int) -> tuple[int, list[dict]]:
    if not path.exists():
        return position, []
    events: list[dict] = []
    with path.open("r", encoding="utf-8") as handle:
        handle.seek(position)
        for line in handle:
            try:
                value = json.loads(line)
            except json.JSONDecodeError:
                continue
            if value.get("run_id") == run_id:
                events.append(value)
        return handle.tell(), events


def _print_watch_event(console: Console, event: dict) -> None:
    name = event.get("event", "event")
    details = event.get("details") or {}
    stage = details.get("stage", "")
    label = details.get("label") or STAGE_LABELS.get(stage, stage)
    icons = {
        "stage_started": "→",
        "stage_completed": "✓",
        "stage_waiting": "●",
        "stage_retrying": "↻",
        "stage_failed": "✗",
        "run_error": "✗",
        "run_finished": "✓",
    }
    if name not in icons:
        return
    text = label or name.replace("_", " ")
    if name == "stage_retrying":
        text += " (bağlantı yeniden deneniyor)"
    console.print(f"{icons[name]} {text}")


if __name__ == "__main__":
    app()

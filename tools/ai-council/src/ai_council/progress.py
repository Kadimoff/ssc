"""Progress events, stage labels, and user-facing error summaries."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable, Literal

from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn


ProgressPhase = Literal["started", "completed", "waiting", "retrying", "failed"]


STAGE_LABELS = {
    "workspace": "Çalışma alanı hazırlanıyor",
    "plan": "Codex uygulama planını hazırlıyor",
    "crew_review": "CrewAI uzmanları planı inceliyor",
    "approval": "Kullanıcı plan onayı bekleniyor",
    "implementation": "Codex onaylanan değişiklikleri uyguluyor",
    "verification": "Test, lint ve build kontrolleri çalışıyor",
    "glm_review": "Claude Code / GLM değişiklikleri inceliyor",
    "correction": "Codex inceleme bulgularını düzeltiyor",
    "finish": "Sonuç raporu hazırlanıyor",
}


@dataclass(frozen=True)
class ProgressEvent:
    run_id: str
    stage: str
    phase: ProgressPhase
    label: str
    details: dict[str, Any] = field(default_factory=dict)


ProgressCallback = Callable[[ProgressEvent], None]


_TRANSIENT_NETWORK_MARKERS = (
    "failed to lookup address information",
    "temporary failure in name resolution",
    "name or service not known",
    "http/request failed",
    "failed to connect to websocket",
    "transport channel closed",
    "connection reset",
    "connection timed out",
    "timeout waiting for child process to exit",
)


def is_transient_network_error(error: BaseException | str) -> bool:
    value = str(error).lower()
    return any(marker in value for marker in _TRANSIENT_NETWORK_MARKERS)


def friendly_error(error: BaseException) -> str:
    value = str(error).strip()
    if value.startswith("Unknown run:"):
        return f"Run ID bulunamadı:{value.removeprefix('Unknown run:')}"
    if is_transient_network_error(value):
        return (
            "Codex/GLM ağına bağlanılamadı (DNS, HTTP veya WebSocket). "
            "Bağlantıyı kontrol edip aynı Run ID ile resume çalıştırın."
        )
    first_line = next((line.strip() for line in value.splitlines() if line.strip()), "Bilinmeyen hata")
    return first_line[:500]


class TerminalProgress:
    """Render one live stage at a time, with a plain-text fallback for pipes."""

    def __init__(self) -> None:
        self.console = Console(stderr=True)
        self.run_id: str | None = None
        self._task_id: int | None = None
        self._active_stage: str | None = None
        self._progress = Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            TimeElapsedColumn(),
            console=self.console,
            transient=True,
        )

    def __enter__(self) -> "TerminalProgress":
        if self.console.is_terminal:
            self._progress.start()
        return self

    def __exit__(self, *_args: object) -> None:
        self.close()

    def close(self) -> None:
        if self.console.is_terminal:
            self._progress.stop()

    def __call__(self, event: ProgressEvent) -> None:
        if self.run_id is None:
            self.run_id = event.run_id
            self.console.print(f"[bold]Run ID:[/bold] {event.run_id}")

        if event.phase == "started":
            self._start(event)
        elif event.phase == "retrying":
            self._message(f"[yellow]↻[/yellow] {event.label}: bağlantı yeniden deneniyor")
        elif event.phase == "completed":
            self._stop_stage(event.stage)
            self._message(f"[green]✓[/green] {event.label}")
        elif event.phase == "waiting":
            self._stop_stage(self._active_stage)
            self._message(f"[cyan]●[/cyan] {event.label}")
        elif event.phase == "failed":
            self._stop_stage(event.stage)
            self._message(f"[red]✗[/red] {event.label}")

    def _start(self, event: ProgressEvent) -> None:
        self._stop_stage(self._active_stage)
        self._active_stage = event.stage
        if self.console.is_terminal:
            self._task_id = self._progress.add_task(event.label, total=None)
        else:
            self._message(f"→ {event.label}")

    def _stop_stage(self, stage: str | None) -> None:
        if stage is None or stage != self._active_stage:
            return
        if self._task_id is not None and self.console.is_terminal:
            self._progress.remove_task(self._task_id)
        self._task_id = None
        self._active_stage = None

    def _message(self, value: str) -> None:
        self.console.print(value)

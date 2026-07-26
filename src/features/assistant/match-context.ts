import type { StartupRecord } from '@/data/types'

export function buildContextualMatchPrompt(startup: StartupRecord | undefined, prompts: string[]) {
  const requirements = prompts.map((item) => item.trim()).filter(Boolean)
  const context = startup
    ? [
        `Startup context: ${startup.name}, ${startup.sector}, ${startup.stage} stage, ${startup.location}.`,
        `Current need: ${startup.openRoles.map((role) => `${role.title} (${role.skills.join(', ')})`).join('; ') || startup.roles}.`,
      ].join(' ')
    : ''
  return [context, ...requirements].filter(Boolean).join(' ')
}

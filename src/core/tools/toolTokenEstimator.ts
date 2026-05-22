import type { ToolDefinition } from '../../types/domain.js'

export function serializeToolForCounting(tool: ToolDefinition): string {
  return JSON.stringify({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  })
}

export function serializeToolsForCounting(tools: ToolDefinition[]): string {
  return tools.map(serializeToolForCounting).join('\n')
}

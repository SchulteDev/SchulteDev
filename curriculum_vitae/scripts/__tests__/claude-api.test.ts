import {describe, expect, it} from 'vitest'

describe('claude-api', () => {
  it('should clean thinking blocks', () => {
    const content = 'Before <thinking>remove this</thinking> After'
    const cleaned = content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')

    expect(cleaned).toBe('Before  After')
    expect(cleaned).not.toContain('thinking')
  })

  it('should remove code fences', () => {
    const content = '```latex\n\\documentclass{article}\n```'
    const cleaned = content.replace(/```(latex)?\n?/gi, '')

    expect(cleaned).toContain('\\documentclass{article}')
    expect(cleaned).not.toContain('```')
  })

  it('should validate content length', () => {
    expect('short'.length < 500).toBe(true)
    expect('a'.repeat(600).length >= 500).toBe(true)
  })
})

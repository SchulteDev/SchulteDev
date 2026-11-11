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

describe('createApiRequest', () => {
  it('should use adaptive thinking with effort instead of a thinking budget', async () => {
    const {createApiRequest} = await import('../claude-api.js')
    const {API_EFFORT, API_MODEL, MAX_TOKENS} = await import('../config.js')
    const request = createApiRequest('prompt')

    expect(request.model).toBe(API_MODEL)
    expect(request.max_tokens).toBe(MAX_TOKENS)
    expect(request.stream).toBe(true)
    expect(request.thinking).toEqual({type: 'adaptive'})
    expect(request.output_config).toEqual({effort: API_EFFORT})
    expect(JSON.stringify(request)).not.toContain('budget_tokens')
  })

  it('should opt into server-side refusal fallbacks', async () => {
    const {createApiRequest} = await import('../claude-api.js')
    const request = createApiRequest('prompt')

    expect(request.betas).toContain('server-side-fallback-2026-07-01')
    expect(request.fallbacks).toBe('default')
  })
})

describe('processApiStream', () => {
  const toStream = (chunks: unknown[]) => (async function* () {
    yield* chunks
  })()

  it('should collect text, usage, stop reason and serving model', async () => {
    const {processApiStream} = await import('../claude-api.js')
    const result = await processApiStream(toStream([
      {type: 'message_start', message: {model: 'claude-sonnet-5-5'}},
      {type: 'content_block_delta', delta: {type: 'thinking_delta', thinking: ''}},
      {type: 'content_block_delta', delta: {type: 'text_delta', text: 'Hello '}},
      {type: 'content_block_delta', delta: {type: 'text_delta', text: 'World'}},
      {type: 'message_delta', delta: {stop_reason: 'end_turn'}, usage: {output_tokens: 42}},
    ]))

    expect(result).toEqual({
      content: 'Hello World',
      usage: {output_tokens: 42},
      stopReason: 'end_turn',
      stopDetails: null,
      servedBy: 'claude-sonnet-5-5',
    })
  })

  it('should report the fallback model when the requested model declines', async () => {
    const {processApiStream} = await import('../claude-api.js')
    const result = await processApiStream(toStream([
      {type: 'message_start', message: {model: 'claude-sonnet-5-5'}},
      {type: 'content_block_delta', delta: {type: 'text_delta', text: 'Part 1 '}},
      {
        type: 'content_block_start',
        content_block: {type: 'fallback', from: {model: 'claude-sonnet-5-5'}, to: {model: 'claude-sonnet-5'}}
      },
      {type: 'content_block_delta', delta: {type: 'text_delta', text: 'Part 2'}},
      {type: 'message_delta', delta: {stop_reason: 'end_turn'}},
    ]))

    expect(result.content).toBe('Part 1 Part 2')
    expect(result.servedBy).toBe('claude-sonnet-5')
  })

  it('should surface refusal and truncation stop reasons', async () => {
    const {processApiStream} = await import('../claude-api.js')
    const refused = await processApiStream(toStream([
      {type: 'message_delta', delta: {stop_reason: 'refusal', stop_details: {type: 'refusal', category: 'cyber'}}},
    ]))
    const truncated = await processApiStream(toStream([
      {type: 'content_block_delta', delta: {type: 'text_delta', text: '\\documentclass'}},
      {type: 'message_delta', delta: {stop_reason: 'max_tokens'}},
    ]))

    expect(refused.stopReason).toBe('refusal')
    expect(refused.stopDetails?.category).toBe('cyber')
    expect(truncated.stopReason).toBe('max_tokens')
  })
})

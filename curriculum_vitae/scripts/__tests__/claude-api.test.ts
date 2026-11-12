import type {Message} from '@anthropic-ai/sdk/resources'
import {describe, expect, it} from 'vitest'

describe('createApiRequest', () => {
  it('should use adaptive thinking with effort instead of a thinking budget', async () => {
    const {createApiRequest} = await import('../claude-api.js')
    const {API_EFFORT, API_MODEL, MAX_TOKENS} = await import('../config.js')
    const request = createApiRequest('prompt')

    expect(request.model).toBe(API_MODEL)
    expect(request.max_tokens).toBe(MAX_TOKENS)
    expect(request.thinking).toEqual({type: 'adaptive'})
    expect(request.output_config).toEqual({effort: API_EFFORT})
    expect(JSON.stringify(request)).not.toContain('budget_tokens')
  })
})

describe('getResponseText', () => {
  it('should join text blocks and skip thinking blocks', async () => {
    const {getResponseText} = await import('../claude-api.js')
    const message = {
      content: [
        {type: 'thinking', thinking: '', signature: 'sig'},
        {type: 'text', text: 'Hello ', citations: null},
        {type: 'text', text: 'World', citations: null},
      ],
    } as unknown as Message

    expect(getResponseText(message)).toBe('Hello World')
  })
})

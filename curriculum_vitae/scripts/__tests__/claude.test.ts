import Anthropic, {APIError} from '@anthropic-ai/sdk'
import type {Message} from '@anthropic-ai/sdk/resources'
import {describe, expect, it, vi} from 'vitest'
import {createApiRequest, getCompleteText, sendPrompt} from '../claude.js'
import {API_EFFORT, API_MODEL, MAX_TOKENS} from '../config.js'

const message = (text: string, stopReason: string, stopDetails: unknown = null) => ({
  content: [{type: 'thinking', thinking: '', signature: 'sig'}, {type: 'text', text, citations: null}],
  stop_reason: stopReason,
  stop_details: stopDetails,
  usage: {input_tokens: 5, output_tokens: 10},
}) as unknown as Message

const clientReturning = (finalMessage: () => Promise<Message>) => {
  const stream = vi.fn(() => ({finalMessage}))
  return {stream, client: {messages: {stream}} as unknown as Anthropic}
}

describe('createApiRequest', () => {
  it('should use adaptive thinking with effort instead of a thinking budget', () => {
    const request = createApiRequest('prompt')

    expect(request.model).toBe(API_MODEL)
    expect(request.max_tokens).toBe(MAX_TOKENS)
    expect(request.messages).toEqual([{role: 'user', content: 'prompt'}])
    expect(request.thinking).toEqual({type: 'adaptive'})
    expect(request.output_config).toEqual({effort: API_EFFORT})
    expect(JSON.stringify(request)).not.toContain('budget_tokens')
  })
})

describe('sendPrompt', () => {
  it('should stream the request and return the final message', async () => {
    const final = message('\\documentclass{article}', 'end_turn')
    const {stream, client} = clientReturning(() => Promise.resolve(final))

    await expect(sendPrompt('prompt', client)).resolves.toBe(final)
    expect(stream).toHaveBeenCalledWith(createApiRequest('prompt'))
  })

  it('should report status and request ID of an API error', async () => {
    const apiError = APIError.generate(
      400,
      {type: 'error', error: {type: 'invalid_request_error', message: 'bad model'}},
      undefined,
      new Headers({'request-id': 'req_123'})
    )
    const {client} = clientReturning(() => Promise.reject(apiError))

    await expect(sendPrompt('prompt', client)).rejects.toThrow(/\(400, request ID req_123\)/)
  })

  it('should pass other errors through', async () => {
    const {client} = clientReturning(() => Promise.reject(new Error('socket hang up')))

    await expect(sendPrompt('prompt', client)).rejects.toThrow('socket hang up')
  })
})

describe('getCompleteText', () => {
  it('should join the text blocks and skip thinking blocks', () => {
    const final = message('Hello ', 'end_turn')
    final.content.push({type: 'text', text: 'World', citations: null})

    expect(getCompleteText(final)).toBe('Hello World')
  })

  it('should fail with category and explanation on a refusal', () => {
    const refusal = message('', 'refusal', {type: 'refusal', category: 'cyber', explanation: 'declined'})

    expect(() => getCompleteText(refusal)).toThrow('(refusal, cyber): declined')
  })

  it('should fail on a refusal without details', () => {
    expect(() => getCompleteText(message('', 'refusal'))).toThrow(/\(refusal, unknown category\)$/)
  })

  it('should fail on a response truncated at max_tokens', () => {
    expect(() => getCompleteText(message('\\documentclass{art', 'max_tokens'))).toThrow(/truncated/)
  })

  it.each(['model_context_window_exceeded', 'pause_turn'])('should fail on an incomplete response (%s)', stopReason => {
    expect(() => getCompleteText(message('\\documentclass{art', stopReason))).toThrow(`stop reason: ${stopReason}`)
  })

  it('should fail on an empty response', () => {
    expect(() => getCompleteText(message('   ', 'end_turn'))).toThrow(/empty/)
  })
})

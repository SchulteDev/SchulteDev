import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {APIError} from '@anthropic-ai/sdk'
import {createApiRequest, getCompleteText, sendPrompt} from '../claude.ts'
import {API_EFFORT, API_MODEL, MAX_TOKENS} from '../config.ts'
import {fakeClient as clientReturning, fakeMessage as message} from './fakes.ts'

describe('createApiRequest', () => {
  it('should use adaptive thinking with effort instead of a thinking budget', () => {
    const request = createApiRequest('prompt')

    assert.equal(request.model, API_MODEL)
    assert.equal(request.max_tokens, MAX_TOKENS)
    assert.deepEqual(request.messages, [{role: 'user', content: 'prompt'}])
    assert.deepEqual(request.thinking, {type: 'adaptive'})
    assert.deepEqual(request.output_config, {effort: API_EFFORT})
    assert.ok(!JSON.stringify(request).includes('budget_tokens'))
  })
})

describe('sendPrompt', () => {
  it('should stream the request and return the final message', async () => {
    const final = message('\\documentclass{article}', 'end_turn')
    const {stream, client} = clientReturning(() => Promise.resolve(final))

    assert.equal(await sendPrompt('prompt', client), final)
    assert.deepEqual(stream.mock.calls.map(call => call.arguments), [[createApiRequest('prompt')]])
  })

  it('should report status and request ID of an API error', async () => {
    const apiError = APIError.generate(
      400,
      {type: 'error', error: {type: 'invalid_request_error', message: 'bad model'}},
      undefined,
      new Headers({'request-id': 'req_123'})
    )
    const {client} = clientReturning(() => Promise.reject(apiError))

    await assert.rejects(sendPrompt('prompt', client), /\(400, request ID req_123\)/)
  })

  it('should pass other errors through', async () => {
    const {client} = clientReturning(() => Promise.reject(new Error('socket hang up')))

    await assert.rejects(sendPrompt('prompt', client), /^Error: socket hang up$/)
  })
})

describe('getCompleteText', () => {
  it('should join the text blocks and skip thinking blocks', () => {
    const final = message('Hello ', 'end_turn')
    final.content.push({type: 'text', text: 'World', citations: null})

    assert.equal(getCompleteText(final), 'Hello World')
  })

  it('should fail with category and explanation on a refusal', () => {
    const refusal = message('', 'refusal', {type: 'refusal', category: 'cyber', explanation: 'declined'})

    assert.throws(() => getCompleteText(refusal), /\(refusal, cyber\): declined/)
  })

  it('should fail on a refusal without details', () => {
    assert.throws(() => getCompleteText(message('', 'refusal')), /\(refusal, unknown category\)$/)
  })

  it('should report the thinking tokens of a response truncated at max_tokens', () => {
    const truncated = message('', 'max_tokens')
    truncated.usage = {...truncated.usage, output_tokens_details: {thinking_tokens: 64000}} as typeof truncated.usage

    assert.throws(() => getCompleteText(truncated), /truncated at MAX_TOKENS=\d+ \(thinking tokens: 64000\)$/)
  })

  it('should fail on a response truncated at max_tokens without token details', () => {
    assert.throws(() => getCompleteText(message('\\documentclass{art', 'max_tokens')), /\(thinking tokens: unknown\)$/)
  })

  for (const stopReason of ['model_context_window_exceeded', 'pause_turn']) {
    it(`should fail on an incomplete response (${stopReason})`, () => {
      assert.throws(() => getCompleteText(message('\\documentclass{art', stopReason)),
        {message: `Response is incomplete (stop reason: ${stopReason})`})
    })
  }

  it('should fail on an empty response', () => {
    assert.throws(() => getCompleteText(message('   ', 'end_turn')), /empty/)
  })
})

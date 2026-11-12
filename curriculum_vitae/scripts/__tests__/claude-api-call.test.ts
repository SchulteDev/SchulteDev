import fs from 'fs-extra'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

const {mockStream} = vi.hoisted(() => ({mockStream: vi.fn()}))

vi.mock('@anthropic-ai/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@anthropic-ai/sdk')>()
  return {
    default: class {
      static readonly APIError = actual.default.APIError
      messages = {stream: mockStream}
    }
  }
})

const {APIError} = await vi.importActual<typeof import('@anthropic-ai/sdk')>('@anthropic-ai/sdk')
const {callClaudeApi, createApiRequest} = await import('../claude-api.js')
const {getResponseFile} = await import('../config.js')
const {default: logger} = await import('../logger.js')

const respondWith = (text: string, stopReason: string, stopDetails: unknown = null) =>
  mockStream.mockReturnValue({
    finalMessage: () => Promise.resolve({
      content: [{type: 'thinking', thinking: '', signature: 'sig'}, {type: 'text', text, citations: null}],
      stop_reason: stopReason,
      stop_details: stopDetails,
      usage: {input_tokens: 5, output_tokens: 10},
    })
  })

describe('callClaudeApi with the API', () => {
  const responseFile = getResponseFile('professional')
  // Only touch files callApi writes: other test files run in parallel and use tmp/ too
  const isApiLog = (file: string) => file.startsWith('claude-response-professional-')
  let existingLogs: Set<string>

  beforeEach(() => {
    fs.ensureDirSync('tmp')
    existingLogs = new Set(fs.readdirSync('tmp').filter(isApiLog))
    fs.removeSync(responseFile)
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
    vi.stubEnv('SKIP_API', 'false')
    mockStream.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    for (const file of fs.readdirSync('tmp').filter(isApiLog)) {
      if (!existingLogs.has(file)) fs.removeSync(`tmp/${file}`)
    }
    fs.removeSync(responseFile)
  })

  it('should stream the request and save the text of the final message', async () => {
    respondWith('\\documentclass{article}', 'end_turn')

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(true)

    expect(mockStream).toHaveBeenCalledWith(createApiRequest('prompt'))
    const saved = fs.readJsonSync(responseFile)
    expect(saved.content).toEqual([{type: 'text', text: '\\documentclass{article}'}])
    expect(saved.usage).toEqual({input_tokens: 5, output_tokens: 10})
  })

  it('should fail and log the category on a refusal', async () => {
    const error = vi.spyOn(logger, 'error').mockImplementation(() => {})
    respondWith('', 'refusal', {type: 'refusal', category: 'cyber', explanation: 'declined'})

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
    expect(fs.existsSync(responseFile)).toBe(false)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('refusal, cyber): declined'))
  })

  it('should fail on a response truncated at max_tokens', async () => {
    respondWith('\\documentclass{art', 'max_tokens')

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
    expect(fs.existsSync(responseFile)).toBe(false)
  })

  it('should fail on an empty response', async () => {
    respondWith('   ', 'end_turn')

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
  })

  it('should log status and request ID when the API returns an error', async () => {
    const error = vi.spyOn(logger, 'error').mockImplementation(() => {})
    mockStream.mockReturnValue({
      finalMessage: () => Promise.reject(APIError.generate(
        400,
        {type: 'error', error: {type: 'invalid_request_error', message: 'bad model'}},
        undefined,
        new Headers({'request-id': 'req_123'})
      ))
    })

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/\(400, request ID req_123\)/))
  })

  it('should log the message of other errors', async () => {
    const error = vi.spyOn(logger, 'error').mockImplementation(() => {})
    mockStream.mockReturnValue({finalMessage: () => Promise.reject(new Error('socket hang up'))})

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('socket hang up'))
  })

  it('should fail without a prompt', async () => {
    await expect(callClaudeApi('', 'professional')).resolves.toBe(false)
    expect(mockStream).not.toHaveBeenCalled()
  })
})

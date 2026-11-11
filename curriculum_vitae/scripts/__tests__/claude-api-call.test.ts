import fs from 'fs-extra'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

const {mockCreate} = vi.hoisted(() => ({mockCreate: vi.fn()}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {create: mockCreate}
  }
}))

const {callClaudeApi, createApiRequest} = await import('../claude-api.js')
const {getResponseFile} = await import('../config.js')

const toStream = (chunks: unknown[]) => (async function* () {
  yield* chunks
})()

const textStream = (text: string, stopReason: string) => toStream([
  {type: 'content_block_delta', delta: {type: 'text_delta', text}},
  {type: 'message_delta', delta: {stop_reason: stopReason}, usage: {output_tokens: 10}},
])

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
    mockCreate.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    for (const file of fs.readdirSync('tmp').filter(isApiLog)) {
      if (!existingLogs.has(file)) fs.removeSync(`tmp/${file}`)
    }
    fs.removeSync(responseFile)
  })

  it('should send the request and save the response', async () => {
    mockCreate.mockResolvedValue(textStream('\\documentclass{article}', 'end_turn'))

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(true)

    expect(mockCreate).toHaveBeenCalledWith(createApiRequest('prompt'))
    const saved = fs.readJsonSync(responseFile)
    expect(saved.content[0].text).toBe('\\documentclass{article}')
  })

  it.each(['refusal', 'max_tokens'])('should fail on stop_reason %s', async (stopReason) => {
    mockCreate.mockResolvedValue(textStream('\\documentclass{art', stopReason))

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
    expect(fs.existsSync(responseFile)).toBe(false)
  })

  it('should fail on an empty response', async () => {
    mockCreate.mockResolvedValue(textStream('   ', 'end_turn'))

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
  })

  it('should fail when the API call throws', async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error('400 bad request'), {response: {status: 400}}))

    await expect(callClaudeApi('prompt', 'professional')).resolves.toBe(false)
  })

  it('should fail without a prompt', async () => {
    await expect(callClaudeApi('', 'professional')).resolves.toBe(false)
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

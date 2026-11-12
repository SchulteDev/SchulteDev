import assert from 'node:assert/strict'
import {afterEach, describe, it} from 'node:test'

const UNSET = {API_MODEL: '', API_EFFORT: '', CV_TYPES: '', SKIP_API: '', MAX_TOKENS: '', CAREER_FILE: ''}
const originalEnv = {...process.env}
let loads = 0

// A new query string re-evaluates config.ts with the current environment
const loadConfig = async (env: Record<string, string> = {}): Promise<typeof import('../config.ts')> => {
  Object.assign(process.env, UNSET, env)
  return import(`../config.ts?load=${loads++}`)
}

describe('config', () => {
  afterEach(() => {
    for (const key of Object.keys(UNSET)) delete process.env[key]
    Object.assign(process.env, originalEnv)
  })

  it('should default to all CV types via Claude Sonnet 5.5 at xhigh effort', async () => {
    const config = await loadConfig()
    assert.equal(config.API_MODEL, 'claude-sonnet-5-5')
    assert.equal(config.API_EFFORT, 'xhigh')
    assert.equal(config.MAX_TOKENS, 64000)
    assert.deepEqual(config.CV_TYPES_TO_PROCESS, ['professional', 'anti'])
    assert.equal(config.SKIP_API, false)
  })

  it('should accept an explicit model and effort', async () => {
    const config = await loadConfig({API_MODEL: 'claude-opus-5-5', API_EFFORT: 'medium'})
    assert.equal(config.API_MODEL, 'claude-opus-5-5')
    assert.equal(config.API_EFFORT, 'medium')
  })

  it('should reject an unknown effort level', async () => {
    await assert.rejects(loadConfig({API_EFFORT: 'extreme'}))
  })

  it('should parse a comma-separated list of CV types', async () => {
    assert.deepEqual((await loadConfig({CV_TYPES: ' anti '})).CV_TYPES_TO_PROCESS, ['anti'])
    assert.deepEqual((await loadConfig({CV_TYPES: 'anti, professional'})).CV_TYPES_TO_PROCESS,
      ['anti', 'professional'])
  })

  it('should process a repeated CV type once', async () => {
    assert.deepEqual((await loadConfig({CV_TYPES: 'anti,anti'})).CV_TYPES_TO_PROCESS, ['anti'])
  })

  it('should reject a fractional MAX_TOKENS', async () => {
    await assert.rejects(loadConfig({MAX_TOKENS: '32000.5'}))
  })

  it('should reject an unknown CV type', async () => {
    await assert.rejects(loadConfig({CV_TYPES: 'professional,funny'}))
  })

  it('should read SKIP_API=false as false', async () => {
    assert.equal((await loadConfig({SKIP_API: 'false'})).SKIP_API, false)
    assert.equal((await loadConfig({SKIP_API: 'true'})).SKIP_API, true)
  })

  it('should point to the committed CV files', async () => {
    const {getCvFile} = await loadConfig()
    assert.equal(getCvFile('professional'), '../markus-schulte-dev-professional-cv.tex')
    assert.equal(getCvFile('anti'), '../markus-schulte-dev-anti-cv.tex')
  })
})

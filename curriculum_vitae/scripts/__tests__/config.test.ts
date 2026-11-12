import {afterEach, describe, expect, it, vi} from 'vitest'

const UNSET = {API_MODEL: '', API_EFFORT: '', CV_TYPES: '', SKIP_API: '', MAX_TOKENS: '', CAREER_FILE: ''}

const loadConfig = async (env: Record<string, string> = {}) => {
  vi.resetModules()
  for (const [key, value] of Object.entries({...UNSET, ...env})) vi.stubEnv(key, value)
  return import('../config.js')
}

describe('config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('should default to all CV types via Claude Sonnet 5.5 at xhigh effort', async () => {
    const config = await loadConfig()
    expect(config.API_MODEL).toBe('claude-sonnet-5-5')
    expect(config.API_EFFORT).toBe('xhigh')
    expect(config.MAX_TOKENS).toBe(64000)
    expect(config.CV_TYPES_TO_PROCESS).toEqual(['professional', 'anti'])
    expect(config.SKIP_API).toBe(false)
  })

  it('should accept an explicit model and effort', async () => {
    const config = await loadConfig({API_MODEL: 'claude-opus-5-5', API_EFFORT: 'medium'})
    expect(config.API_MODEL).toBe('claude-opus-5-5')
    expect(config.API_EFFORT).toBe('medium')
  })

  it('should reject an unknown effort level', async () => {
    await expect(loadConfig({API_EFFORT: 'extreme'})).rejects.toThrow()
  })

  it('should parse a comma-separated list of CV types', async () => {
    expect((await loadConfig({CV_TYPES: ' anti '})).CV_TYPES_TO_PROCESS).toEqual(['anti'])
    expect((await loadConfig({CV_TYPES: 'anti, professional'})).CV_TYPES_TO_PROCESS)
      .toEqual(['anti', 'professional'])
  })

  it('should process a repeated CV type once', async () => {
    expect((await loadConfig({CV_TYPES: 'anti,anti'})).CV_TYPES_TO_PROCESS).toEqual(['anti'])
  })

  it('should reject a fractional MAX_TOKENS', async () => {
    await expect(loadConfig({MAX_TOKENS: '32000.5'})).rejects.toThrow()
  })

  it('should reject an unknown CV type', async () => {
    await expect(loadConfig({CV_TYPES: 'professional,funny'})).rejects.toThrow()
  })

  it('should read SKIP_API=false as false', async () => {
    expect((await loadConfig({SKIP_API: 'false'})).SKIP_API).toBe(false)
    expect((await loadConfig({SKIP_API: 'true'})).SKIP_API).toBe(true)
  })

  it('should point to the committed CV files', async () => {
    const {getCvFile} = await loadConfig()
    expect(getCvFile('professional')).toBe('../markus-schulte-dev-professional-cv.tex')
    expect(getCvFile('anti')).toBe('../markus-schulte-dev-anti-cv.tex')
  })
})

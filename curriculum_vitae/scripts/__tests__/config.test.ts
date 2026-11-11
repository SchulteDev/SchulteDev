import {afterEach, describe, expect, it, vi} from 'vitest'
import {getCvFile, getResponseFile, getTempFile} from '../config.js'

describe('config', () => {
  describe('file paths', () => {
    it('should return correct CV file paths', () => {
      expect(getCvFile('professional')).toBe('../markus-schulte-dev-professional-cv.tex')
      expect(getCvFile('anti')).toBe('../markus-schulte-dev-anti-cv.tex')
    })

    it('should return correct response file paths', () => {
      expect(getResponseFile('professional')).toBe('tmp/response_professional.json')
      expect(getResponseFile('anti')).toBe('tmp/response_anti.json')
    })

    it('should return correct temp file paths', () => {
      expect(getTempFile('professional')).toBe('tmp/temp_professional.tex')
      expect(getTempFile('anti')).toBe('tmp/temp_anti.tex')
    })
  })

  describe('API settings', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
      vi.resetModules()
    })

    const loadConfig = async (env: Record<string, string | undefined>) => {
      vi.resetModules()
      for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
      return import('../config.js')
    }

    it('should default to Claude Sonnet 5.5 at high effort', async () => {
      const config = await loadConfig({API_MODEL: undefined, API_EFFORT: undefined})
      expect(config.API_MODEL).toBe('claude-sonnet-5-5')
      expect(config.API_EFFORT).toBe('high')
    })

    it('should treat empty workflow inputs as unset', async () => {
      const config = await loadConfig({API_MODEL: '', API_EFFORT: ''})
      expect(config.API_MODEL).toBe('claude-sonnet-5-5')
      expect(config.API_EFFORT).toBe('high')
    })

    it('should accept an explicit model and effort', async () => {
      const config = await loadConfig({API_MODEL: 'claude-opus-5-5', API_EFFORT: 'xhigh'})
      expect(config.API_MODEL).toBe('claude-opus-5-5')
      expect(config.API_EFFORT).toBe('xhigh')
    })

    it('should reject an unknown effort level', async () => {
      await expect(loadConfig({API_EFFORT: 'extreme'})).rejects.toThrow()
    })
  })
})

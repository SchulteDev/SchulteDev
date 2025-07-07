import {describe, expect, it} from 'vitest'
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
})

import {afterEach, describe, expect, it, vi} from 'vitest'
import {execFileSync} from 'child_process'
import {existsSync, mkdirSync, readFileSync, rmSync} from 'fs'
import {CAREER_FILE, DIFF_FILE, GIT_DIFF_RANGE} from '../config.js'
import {generateGitDiff, shouldSkipDiff} from '../transform-utils.js'

const {mockDiff} = vi.hoisted(() => ({mockDiff: vi.fn()}))

vi.mock('simple-git', () => ({simpleGit: () => ({diff: mockDiff})}))

describe('transform-utils', () => {
  describe('generateGitDiff', () => {
    afterEach(() => {
      mockDiff.mockReset()
      rmSync(DIFF_FILE, {force: true})
    })

    it('should diff CAREER_FILE as given and write the result to DIFF_FILE', async () => {
      mkdirSync('tmp', {recursive: true})
      mockDiff.mockResolvedValue('+ new career entry')

      expect(await generateGitDiff()).toBe(true)
      expect(mockDiff).toHaveBeenCalledWith([`HEAD~${GIT_DIFF_RANGE}`, 'HEAD', '--', CAREER_FILE])
      expect(readFileSync(DIFF_FILE, 'utf8')).toBe('+ new career entry')
    })

    it('should throw when git diff fails', async () => {
      mockDiff.mockRejectedValue(new Error('bad revision'))

      await expect(generateGitDiff()).rejects.toThrow('Failed to generate git diff: bad revision')
      expect(existsSync(DIFF_FILE)).toBe(false)
    })

    it('should use a CAREER_FILE pathspec that git resolves to the tracked career file', () => {
      // git resolves pathspecs relative to the working directory (the scripts folder)
      const tracked = execFileSync('git', ['ls-files', '--full-name', '--error-unmatch', '--', CAREER_FILE], {encoding: 'utf8'})
      expect(tracked.trim()).toBe('_data/career.md')
    })
  })

  describe('shouldSkipDiff', () => {
    it('should return true for empty diff content', () => {
      expect(shouldSkipDiff('')).toBe(true)
      expect(shouldSkipDiff('   ')).toBe(true)
      expect(shouldSkipDiff('\n\t')).toBe(true)
    })

    it('should return true for "No changes detected" message', () => {
      expect(shouldSkipDiff('No changes detected in git diff')).toBe(true)
    })

    it('should return false for actual diff content', () => {
      expect(shouldSkipDiff('+ Added line')).toBe(false)
      expect(shouldSkipDiff('- Removed line')).toBe(false)
      expect(shouldSkipDiff('diff --git a/file.txt b/file.txt')).toBe(false)
    })
  })
})

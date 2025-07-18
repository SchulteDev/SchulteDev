import {describe, expect, it} from 'vitest'
import {extractRelativePath, shouldSkipDiff} from '../transform-utils.js'

describe('transform-utils', () => {
  describe('extractRelativePath', () => {
    it('should extract career.md path correctly', () => {
      // Test Unix-style paths
      expect(extractRelativePath('/some/path/_data/career.md')).toBe('_data/career.md')

      // Test Windows-style paths with backslashes
      const windowsPath = 'C:\\path\\_data\\career.md'
      expect(extractRelativePath(windowsPath)).toBe('_data/career.md')

      // Test relative paths
      expect(extractRelativePath('../_data/career.md')).toBe('_data/career.md')
    })

    it('should remove leading ../ from other paths', () => {
      // Unix-style paths
      expect(extractRelativePath('../some/file.txt')).toBe('some/file.txt')
      expect(extractRelativePath('../path/to/file.md')).toBe('path/to/file.md')

      // Windows-style paths
      expect(extractRelativePath('..\\some\\file.txt')).toBe('some/file.txt')
      expect(extractRelativePath('..\\path\\to\\file.md')).toBe('path/to/file.md')
    })

    it('should keep paths without ../ unchanged', () => {
      // Unix-style paths
      expect(extractRelativePath('path/to/file.txt')).toBe('path/to/file.txt')
      expect(extractRelativePath('/absolute/path/file.md')).toBe('/absolute/path/file.md')

      // Windows-style paths - we normalize to forward slashes for consistency
      expect(extractRelativePath('path\\to\\file.txt')).toBe('path/to/file.txt')
      expect(extractRelativePath('C:\\absolute\\path\\file.md')).toBe('C:/absolute/path/file.md')
    })

    it('should handle Windows-specific path formats', () => {
      // Drive letters with different cases
      expect(extractRelativePath('c:\\path\\_data\\career.md')).toBe('_data/career.md')
      expect(extractRelativePath('D:\\path\\_data\\career.md')).toBe('_data/career.md')

      // UNC paths
      expect(extractRelativePath('\\\\server\\share\\_data\\career.md')).toBe('_data/career.md')

      // Mixed separators
      expect(extractRelativePath('C:\\path/_data/career.md')).toBe('_data/career.md')
      expect(extractRelativePath('..\\path/_data/career.md')).toBe('path/_data/career.md')
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

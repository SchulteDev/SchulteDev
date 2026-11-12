import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {ensureDir, hasValidFile, safeDelete, safeFileCopy, safeFileMove} from '../file-utils.js'
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs'

const TEST_DIR = 'tmp/test-utils'

describe('file-utils', () => {
  beforeAll(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, {recursive: true})
    mkdirSync(TEST_DIR, {recursive: true})
  })

  afterAll(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, {recursive: true})
  })

  describe('hasValidFile', () => {
    it('should validate file existence and content', () => {
      const testFile = `${TEST_DIR}/test.txt`
      const emptyFile = `${TEST_DIR}/empty.txt`

      expect(hasValidFile('non-existent')).toBe(false)

      writeFileSync(emptyFile, '')
      expect(hasValidFile(emptyFile)).toBe(false)

      writeFileSync(testFile, 'content')
      expect(hasValidFile(testFile)).toBe(true)
    })
  })

  describe('ensureDir', () => {
    it('should create directories', () => {
      const newDir = `${TEST_DIR}/new`
      expect(existsSync(newDir)).toBe(false)

      ensureDir(newDir)
      expect(existsSync(newDir)).toBe(true)
    })

    it('should create nested directories', () => {
      const nestedDir = `${TEST_DIR}/nested/dir/structure`
      expect(existsSync(nestedDir)).toBe(false)

      ensureDir(nestedDir)
      expect(existsSync(nestedDir)).toBe(true)
    })
  })

  describe('safeFileCopy', () => {
    it('should safely copy files', () => {
      const sourceFile = `${TEST_DIR}/source.txt`
      const destFile = `${TEST_DIR}/dest.txt`
      const content = 'test content'

      writeFileSync(sourceFile, content)

      // Test successful copy
      expect(safeFileCopy(sourceFile, destFile, 'Test file')).toBe(true)
      expect(existsSync(destFile)).toBe(true)
      expect(readFileSync(destFile, 'utf8')).toBe(content)

      // Test copy with non-existent source
      expect(safeFileCopy('non-existent-file', `${TEST_DIR}/should-not-exist.txt`, 'Test file')).toBe(false)
    })
  })

  describe('safeFileMove', () => {
    it('should safely move files', () => {
      const sourceFile = `${TEST_DIR}/move-source.txt`
      const destFile = `${TEST_DIR}/move-dest.txt`
      const content = 'move test content'

      writeFileSync(sourceFile, content)

      // Test successful move
      expect(safeFileMove(sourceFile, destFile)).toBe(true)
      expect(existsSync(sourceFile)).toBe(false)
      expect(existsSync(destFile)).toBe(true)
      expect(readFileSync(destFile, 'utf8')).toBe(content)

      // Test move with non-existent source
      expect(safeFileMove('non-existent-file', `${TEST_DIR}/should-not-exist.txt`)).toBe(false)
    })
  })

  describe('safeDelete', () => {
    it('should safely delete files', () => {
      const fileToDelete = `${TEST_DIR}/delete-me.txt`

      // Create a file to delete
      writeFileSync(fileToDelete, 'delete me')
      expect(existsSync(fileToDelete)).toBe(true)

      // Test deleting existing file
      safeDelete(fileToDelete)
      expect(existsSync(fileToDelete)).toBe(false)

      // Test deleting non-existent file (should not throw)
      expect(() => safeDelete('non-existent-file')).not.toThrow()
    })
  })
})

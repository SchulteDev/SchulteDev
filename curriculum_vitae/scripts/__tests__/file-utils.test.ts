import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {ensureDir, hasValidFile, safeDelete, safeFileCopy, safeFileMove} from '../file-utils.js'
import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'fs'

// Use both Unix-style and Windows-style test directories
const TEST_DIR = 'tmp/test-utils'
const TEST_DIR_WIN = 'tmp\\test-utils-win'

describe('file-utils', () => {
  beforeAll(() => {
    // Clean up and create both test directories
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, {recursive: true})
    if (existsSync(TEST_DIR_WIN)) rmSync(TEST_DIR_WIN, {recursive: true})

    mkdirSync(TEST_DIR, {recursive: true})
    mkdirSync(TEST_DIR_WIN, {recursive: true})
  })

  afterAll(() => {
    // Clean up both test directories
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, {recursive: true})
    if (existsSync(TEST_DIR_WIN)) rmSync(TEST_DIR_WIN, {recursive: true})
  })

  describe('hasValidFile', () => {
    it('should validate file existence and content with Unix-style paths', () => {
      const testFile = `${TEST_DIR}/test.txt`
      const emptyFile = `${TEST_DIR}/empty.txt`

      expect(hasValidFile('non-existent')).toBe(false)

      writeFileSync(emptyFile, '')
      expect(hasValidFile(emptyFile)).toBe(false)

      writeFileSync(testFile, 'content')
      expect(hasValidFile(testFile)).toBe(true)
    })

    it('should validate file existence and content with Windows-style paths', () => {
      const testFile = `${TEST_DIR_WIN}\\test.txt`
      const emptyFile = `${TEST_DIR_WIN}\\empty.txt`

      expect(hasValidFile('non-existent-win')).toBe(false)

      writeFileSync(emptyFile, '')
      expect(hasValidFile(emptyFile)).toBe(false)

      writeFileSync(testFile, 'content')
      expect(hasValidFile(testFile)).toBe(true)
    })
  })

  describe('ensureDir', () => {
    it('should create directories with Unix-style paths', () => {
      const newDir = `${TEST_DIR}/new`
      expect(existsSync(newDir)).toBe(false)

      ensureDir(newDir)
      expect(existsSync(newDir)).toBe(true)
    })

    it('should create directories with Windows-style paths', () => {
      const newDir = `${TEST_DIR_WIN}\\new`
      expect(existsSync(newDir)).toBe(false)

      ensureDir(newDir)
      expect(existsSync(newDir)).toBe(true)
    })

    it('should create nested directories with Windows-style paths', () => {
      const nestedDir = `${TEST_DIR_WIN}\\nested\\dir\\structure`
      expect(existsSync(nestedDir)).toBe(false)

      ensureDir(nestedDir)
      expect(existsSync(nestedDir)).toBe(true)
    })
  })

  describe('safeFileCopy', () => {
    it('should safely copy files with Unix-style paths', () => {
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

    it('should safely copy files with Windows-style paths', () => {
      const sourceFile = `${TEST_DIR_WIN}\\source.txt`
      const destFile = `${TEST_DIR_WIN}\\dest.txt`
      const content = 'windows test content'

      writeFileSync(sourceFile, content)

      // Test successful copy
      expect(safeFileCopy(sourceFile, destFile, 'Test file')).toBe(true)
      expect(existsSync(destFile)).toBe(true)
      expect(readFileSync(destFile, 'utf8')).toBe(content)

      // Test copy with non-existent source
      expect(safeFileCopy('non-existent-win-file', `${TEST_DIR_WIN}\\should-not-exist.txt`, 'Test file')).toBe(false)
    })

    it('should safely copy files between Unix and Windows-style paths', () => {
      const sourceFile = `${TEST_DIR}/mixed-source.txt`
      const destFile = `${TEST_DIR_WIN}\\mixed-dest.txt`
      const content = 'mixed path test content'

      writeFileSync(sourceFile, content)

      // Test copy from Unix to Windows path
      expect(safeFileCopy(sourceFile, destFile, 'Mixed path file')).toBe(true)
      expect(existsSync(destFile)).toBe(true)
      expect(readFileSync(destFile, 'utf8')).toBe(content)
    })
  })

  describe('safeFileMove', () => {
    it('should safely move files with Unix-style paths', () => {
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

    it('should safely move files with Windows-style paths', () => {
      const sourceFile = `${TEST_DIR_WIN}\\move-source.txt`
      const destFile = `${TEST_DIR_WIN}\\move-dest.txt`
      const content = 'windows move test content'

      writeFileSync(sourceFile, content)

      // Test successful move
      expect(safeFileMove(sourceFile, destFile)).toBe(true)
      expect(existsSync(sourceFile)).toBe(false)
      expect(existsSync(destFile)).toBe(true)
      expect(readFileSync(destFile, 'utf8')).toBe(content)

      // Test move with non-existent source
      expect(safeFileMove('non-existent-win-file', `${TEST_DIR_WIN}\\should-not-exist.txt`)).toBe(false)
    })

    it('should safely move files between Unix and Windows-style paths', () => {
      const sourceFile = `${TEST_DIR}/mixed-move-source.txt`
      const destFile = `${TEST_DIR_WIN}\\mixed-move-dest.txt`
      const content = 'mixed path move test content'

      writeFileSync(sourceFile, content)

      // Test move from Unix to Windows path
      expect(safeFileMove(sourceFile, destFile)).toBe(true)
      expect(existsSync(sourceFile)).toBe(false)
      expect(existsSync(destFile)).toBe(true)
      expect(readFileSync(destFile, 'utf8')).toBe(content)
    })
  })

  describe('safeDelete', () => {
    it('should safely delete files with Unix-style paths', () => {
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

    it('should safely delete files with Windows-style paths', () => {
      const fileToDelete = `${TEST_DIR_WIN}\\delete-me.txt`

      // Create a file to delete
      writeFileSync(fileToDelete, 'delete me windows')
      expect(existsSync(fileToDelete)).toBe(true)

      // Test deleting existing file
      safeDelete(fileToDelete)
      expect(existsSync(fileToDelete)).toBe(false)

      // Test deleting non-existent file (should not throw)
      expect(() => safeDelete('non-existent-win-file')).not.toThrow()
    })
  })
})

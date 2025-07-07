import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {ensureDir, hasValidFile} from '../file-utils.js'
import {existsSync, mkdirSync, rmSync, writeFileSync} from 'fs'

const TEST_DIR = 'tmp/test-utils'

describe('file-utils', () => {
  beforeAll(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, {recursive: true})
    mkdirSync(TEST_DIR, {recursive: true})
  })

  afterAll(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, {recursive: true})
  })

  it('should validate file existence and content', () => {
    const testFile = `${TEST_DIR}/test.txt`
    const emptyFile = `${TEST_DIR}/empty.txt`

    expect(hasValidFile('non-existent')).toBe(false)

    writeFileSync(emptyFile, '')
    expect(hasValidFile(emptyFile)).toBe(false)

    writeFileSync(testFile, 'content')
    expect(hasValidFile(testFile)).toBe(true)
  })

  it('should create directories', () => {
    const newDir = `${TEST_DIR}/new`
    expect(existsSync(newDir)).toBe(false)

    ensureDir(newDir)
    expect(existsSync(newDir)).toBe(true)
  })
})

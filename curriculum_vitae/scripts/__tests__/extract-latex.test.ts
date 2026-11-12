import fs from 'fs-extra'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {extractLatex} from '../claude-api.js'
import {getResponseFile, MIN_CONTENT_LENGTH} from '../config.js'

// Uses the anti CV response file: claude-api-call.test.ts runs in parallel on the professional one
const responseFile = getResponseFile('anti')
const outputFile = 'tmp/extract-latex-test-anti.tex'

const writeResponse = (content: unknown) => fs.writeJsonSync(responseFile, {content})

describe('extractLatex', () => {
  beforeEach(() => fs.ensureDirSync('tmp'))

  afterEach(() => {
    fs.removeSync(responseFile)
    fs.removeSync(outputFile)
  })

  it('should write the text block without code fences', () => {
    const latex = String.raw`\documentclass{article}` + '\n' + '%'.repeat(MIN_CONTENT_LENGTH)
    writeResponse([{type: 'text', text: '```latex\n' + latex + '\n```'}])

    expect(extractLatex(outputFile, 'anti')).toBe(true)
    expect(fs.readFileSync(outputFile, 'utf8')).toBe(latex)
  })

  it.each([
    ['no content', undefined],
    ['an empty content list', []],
    ['a non-text first block', [{type: 'thinking', thinking: ''}]],
  ])('should reject a response with %s', (_, content) => {
    writeResponse(content)

    expect(extractLatex(outputFile, 'anti')).toBe(false)
    expect(fs.existsSync(outputFile)).toBe(false)
  })
})

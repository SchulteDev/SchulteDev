import {describe, expect, it} from 'vitest'
import {extractLatex} from '../latex.js'

const document = [
  '\\documentclass{article}',
  '\\begin{document}',
  'x'.repeat(600),
  '\\end{document}',
].join('\n')

describe('extractLatex', () => {
  it('should return a bare document unchanged', () => {
    expect(extractLatex(document)).toBe(document)
  })

  it('should drop code fences', () => {
    expect(extractLatex(`\`\`\`latex\n${document}\n\`\`\``)).toBe(document)
  })

  it('should drop prose before and after the document', () => {
    expect(extractLatex(`Here is your CV:\n\n${document}\n\nGood luck!`)).toBe(document)
  })

  it('should collapse runs of blank lines', () => {
    const spaced = document.replace('\\begin{document}', '\n\n\n\\begin{document}')
    expect(extractLatex(spaced)).toBe(document.replace('\\begin{document}', '\n\\begin{document}'))
  })

  it('should reject a document without an end', () => {
    expect(() => extractLatex(document.replace('\\end{document}', ''))).toThrow(/no complete LaTeX document/)
  })

  it('should reject a response without LaTeX', () => {
    expect(() => extractLatex('I cannot help with that.')).toThrow(/no complete LaTeX document/)
  })

  it('should reject a document without a body', () => {
    expect(() => extractLatex(document.replace('\\begin{document}', ''))).toThrow(/begin\{document\}/)
  })

  it('should reject a placeholder-sized document', () => {
    expect(() => extractLatex('\\documentclass{article}\\begin{document}Hi\\end{document}')).toThrow(/too short/)
  })
})

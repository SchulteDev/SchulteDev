import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {extractLatex} from '../latex.ts'

const document = [
  '\\documentclass{article}',
  '\\begin{document}',
  'x'.repeat(600),
  '\\end{document}',
].join('\n')

describe('extractLatex', () => {
  it('should return a bare document unchanged', () => {
    assert.equal(extractLatex(document), document)
  })

  it('should drop code fences', () => {
    assert.equal(extractLatex(`\`\`\`latex\n${document}\n\`\`\``), document)
  })

  it('should drop prose before and after the document', () => {
    assert.equal(extractLatex(`Here is your CV:\n\n${document}\n\nGood luck!`), document)
  })

  it('should end at the first \\end{document}, as LaTeX does', () => {
    assert.equal(extractLatex(`${document}\n\nNote: text after \\end{document} is ignored.`), document)
  })

  it('should collapse runs of blank lines', () => {
    const spaced = document.replace('\\begin{document}', '\n\n\n\\begin{document}')
    assert.equal(extractLatex(spaced), document.replace('\\begin{document}', '\n\\begin{document}'))
  })

  it('should reject a document without an end', () => {
    assert.throws(() => extractLatex(document.replace('\\end{document}', '')), /no complete LaTeX document/)
  })

  it('should reject a response without LaTeX', () => {
    assert.throws(() => extractLatex('I cannot help with that.'), /no complete LaTeX document/)
  })

  it('should reject a document without a body', () => {
    assert.throws(() => extractLatex(document.replace('\\begin{document}', '')), /begin\{document\}/)
  })

  it('should reject a placeholder-sized document', () => {
    assert.throws(() => extractLatex('\\documentclass{article}\\begin{document}Hi\\end{document}'), /too short/)
  })
})

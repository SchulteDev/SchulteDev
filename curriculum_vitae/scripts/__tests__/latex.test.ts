import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {extractBody, PREAMBLE, toDocument} from '../latex.ts'

const body = `\\cvsection{Profile}\n${'x'.repeat(600)}`
const document = `\\begin{document}\n${body}\n\\end{document}`

describe('extractBody', () => {
  it('should return the body of a bare document', () => {
    assert.equal(extractBody(document), body)
  })

  it('should drop code fences', () => {
    assert.equal(extractBody(`\`\`\`latex\n${document}\n\`\`\``), body)
  })

  it('should drop prose before and after the document', () => {
    assert.equal(extractBody(`Here is your CV:\n\n${document}\n\nGood luck!`), body)
  })

  it('should drop a preamble the model wrote anyway', () => {
    assert.equal(extractBody(`\\documentclass{article}\n\\usepackage{titlesec}\n${document}`), body)
  })

  it('should start at the body, not at a mention of \\begin{document} in the prose', () => {
    assert.equal(extractBody(`Starts with \\begin{document}:\n\`\`\`latex\n${document}\n\`\`\``), body)
  })

  it('should skip prose that quotes \\begin{document} to \\end{document}', () => {
    assert.equal(extractBody(`The body, from \\begin{document} to \\end{document}:\n\`\`\`latex\n${document}\n\`\`\``), body)
  })

  it('should end at the first \\end{document}, as LaTeX does', () => {
    assert.equal(extractBody(`${document}\n\nNote: text after \\end{document} is ignored.`), body)
  })

  it('should collapse runs of blank lines', () => {
    const spaced = document.replace('\\cvsection{Profile}\n', '\\cvsection{Profile}\n\n\n\n')
    assert.equal(extractBody(spaced), body.replace('\\cvsection{Profile}\n', '\\cvsection{Profile}\n\n'))
  })

  it('should reject a body without an end', () => {
    assert.throws(() => extractBody(document.replace('\\end{document}', '')), /no complete document body/)
  })

  it('should reject a body without a start', () => {
    assert.throws(() => extractBody(document.replace('\\begin{document}', '')), /no complete document body/)
  })

  it('should reject a response without LaTeX', () => {
    assert.throws(() => extractBody('I cannot help with that.'), /no complete document body/)
  })

  it('should reject a placeholder-sized body', () => {
    assert.throws(() => extractBody('\\begin{document}Hi\\end{document}'), /too short/)
  })
})

describe('PREAMBLE', () => {
  it('should declare the tagged PDF/UA-1 document before the document class', () => {
    assert.ok(PREAMBLE.startsWith('\\DocumentMetadata{lang=en,pdfstandard=ua-1,tagging=on}\n\\documentclass'))
  })

  it('should leave the body to the model', () => {
    assert.ok(!PREAMBLE.includes('\\begin{document}'))
  })
})

describe('toDocument', () => {
  it('should put the body into the fixed preamble', () => {
    assert.equal(toDocument(body), `${PREAMBLE}\n\n${document}\n`)
  })
})

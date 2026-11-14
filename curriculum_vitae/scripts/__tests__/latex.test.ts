import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {extractBody, PREAMBLE, toDocument} from '../latex.ts'

const body = `\\cvsection{Profile}\n${'x'.repeat(600)}${'\n\\pagebreak\nx'.repeat(3)}`
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

  for (const [rule, forbidden] of [
    ['vertical spacing', '\\vspace{4pt}'],
    ['vertical spacing', '\\vfill'],
    ['vertical spacing', '\\newpage'],
    ['packages, colors or definitions', '\\usepackage{titlesec}'],
    ['packages, colors or definitions', '\\definecolor{Red}{HTML}{FF0000}'],
    ['packages, colors or definitions', '\\newcommand{\\x}{y}'],
    ['list options', '\\begin{itemize}[leftmargin=*]'],
    ['list options', '\\begin{enumerate}[before=x]'],
  ]) {
    it(`should reject ${forbidden} in the body as ${rule}`, () => {
      assert.throws(() => toDocument(`${body}\n${forbidden}`), new RegExp(`breaks the preamble's rules: ${rule}`))
    })
  }

  it('should allow the preamble\'s own commands', () => {
    assert.doesNotThrow(() => toDocument(`\\hypersetup{pdftitle={CV}}\n${body}\n\\begin{itemize}\n\\item \\cvdisclaimer{AI}\n\\end{itemize}`))
  })

  it('should ignore comments, but not escaped percent signs', () => {
    assert.doesNotThrow(() => toDocument(`${body}\n% flexible: no \\vspace or \\pagebreak here`))
    assert.throws(() => toDocument(`${body}\n50\\% faster\\vfill`), /vertical spacing/)
  })

  it('should reject a body with another number of pages', () => {
    assert.throws(() => toDocument(`${body}\n\\pagebreak`), /4 instead of 3 \\pagebreak/)
    assert.throws(() => toDocument(body.replaceAll('\\pagebreak', '')), /0 instead of 3 \\pagebreak/)
  })

  it('should name every broken rule', () => {
    assert.throws(() => toDocument(`\\vfill\\usepackage{x}`), /vertical spacing, packages, colors or definitions, 0 instead of 3/)
  })
})

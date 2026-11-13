import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {buildPrompt} from '../prompts.ts'

describe('buildPrompt', () => {
  const careerData = '# Career\nCut costs by $&5k; templating {{PAGES}} stays verbatim'

  for (const cvType of ['professional', 'anti'] as const) {
    it(`should embed the career data verbatim for the ${cvType} CV`, () => {
      assert.ok(buildPrompt(cvType, careerData).includes(`\`\`\`markdown\n${careerData}\n\`\`\``))
    })
  }

  it('should fill in the page count everywhere', () => {
    const prompt = buildPrompt('professional', '')
    assert.doesNotMatch(prompt, /\{\{|\$\{/)
    assert.ok(prompt.includes('Create exactly 4-page Professional CV'))
    assert.ok(prompt.includes('At most 4 pages: a page 5 is the worst outcome'))
    assert.ok(prompt.includes('63 lines per page'))
    assert.ok(prompt.includes('232 lines in total, no more.'))
  })

  it('should use the instructions of the requested CV type', () => {
    assert.ok(buildPrompt('professional', '').includes('Use metrics, percentages, concrete numbers.'))
    assert.ok(!buildPrompt('professional', '').includes('Anti-CV'))
    assert.ok(buildPrompt('anti', '').includes('self-deprecating humor'))
    assert.ok(!buildPrompt('anti', '').includes('Professional CV'))
  })

  it('should keep LaTeX commands as single backslashes', () => {
    assert.ok(buildPrompt('anti', '').includes('No \\newpage, \\clearpage or \\pagebreak: LaTeX breaks the pages.'))
    assert.ok(buildPrompt('anti', '').includes('\\documentclass[10pt,a4paper]{article} with 1.5cm margins'))
    assert.ok(buildPrompt('anti', '').includes('Headings: \\section* and \\subsection* only'))
    assert.ok(buildPrompt('professional', '').includes('never the before= or after= keys'))
    assert.ok(buildPrompt('professional', '').includes('no \\hspace or other spacing commands'))
    assert.ok(buildPrompt('anti', '').includes('Set pdftitle and pdfauthor with \\hypersetup.'))
    assert.ok(buildPrompt('anti', '').includes('Symbols in text mode (\\texttimes, \\textrightarrow'))
  })
})

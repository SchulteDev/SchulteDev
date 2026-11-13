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

  it('should fill in the page count and the line budget', () => {
    const prompt = buildPrompt('professional', '')
    assert.doesNotMatch(prompt, /\{\{|\$\{/)
    assert.ok(prompt.includes('The CV ends on page 4: running onto page 5 is the failure to avoid'))
    assert.ok(prompt.includes('a page holds about 57 lines of text, a full line about 115 characters'))
    assert.ok(prompt.includes('Size the content to about 205 of the 228 lines of text'))
  })

  it('should describe only the requested CV type', () => {
    assert.ok(buildPrompt('professional', '').includes('create a LuaLaTeX Professional CV: quantified impact'))
    assert.ok(!buildPrompt('professional', '').includes('Anti-CV'))
    assert.ok(buildPrompt('anti', '').includes('create a LuaLaTeX Anti-CV: failures'))
    assert.ok(!buildPrompt('anti', '').includes('Professional CV'))
  })

  it('should put the instructions after the career data', () => {
    const prompt = buildPrompt('anti', 'CAREER')
    assert.ok(prompt.indexOf('CAREER') < prompt.indexOf('From this career data'))
    assert.ok(prompt.endsWith('Output: LuaLaTeX code only.'))
  })

  it('should keep LaTeX commands as single backslashes', () => {
    assert.ok(buildPrompt('anti', '').includes('no \\newpage, \\clearpage or \\pagebreak and no minipage or \\parbox around a section'))
    assert.ok(buildPrompt('anti', '').includes('\\documentclass[10pt,a4paper]{article} with 1.5cm margins'))
    assert.ok(buildPrompt('anti', '').includes('Headings: \\section* and \\subsection* only'))
    assert.ok(buildPrompt('professional', '').includes('never the before= or after= keys'))
    assert.ok(buildPrompt('professional', '').includes('no \\hspace or other spacing commands'))
    assert.ok(buildPrompt('anti', '').includes('Set pdftitle and pdfauthor with \\hypersetup.'))
    assert.ok(buildPrompt('anti', '').includes('Symbols in text mode (\\texttimes, \\textrightarrow'))
  })
})

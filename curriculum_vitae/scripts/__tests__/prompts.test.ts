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
    assert.ok(prompt.includes('Exactly 4 vertical, filled, dense pages.'))
    assert.ok(prompt.includes('Monitor content density for exactly 4 pages.'))
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
    assert.ok(buildPrompt('anti', '').includes('Use \\newpage after each page.'))
    assert.ok(buildPrompt('anti', '').includes('Headings: \\section* and \\subsection* only'))
    assert.ok(buildPrompt('professional', '').includes('never the before= or after= keys'))
    assert.ok(buildPrompt('professional', '').includes('no \\hspace or other spacing commands'))
    assert.ok(buildPrompt('anti', '').includes('Set pdftitle and pdfauthor with \\hypersetup.'))
    assert.ok(buildPrompt('anti', '').includes('Symbols in text mode (\\texttimes, \\textrightarrow'))
  })
})

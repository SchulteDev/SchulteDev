import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {PREAMBLE} from '../latex.ts'
import {buildPrompt} from '../prompts.ts'

describe('buildPrompt', () => {
  const careerData = '# Career\nCut costs by $&5k; templating {{PAGES}} stays verbatim'

  for (const cvType of ['professional', 'anti'] as const) {
    it(`should embed the career data verbatim for the ${cvType} CV`, () => {
      assert.ok(buildPrompt(cvType, careerData).includes(`\`\`\`markdown\n${careerData}\n\`\`\``))
    })
  }

  it('should show the fixed preamble the body goes into', () => {
    assert.ok(buildPrompt('professional', '').includes(`\`\`\`latex\n${PREAMBLE}\n\`\`\``))
  })

  it('should fill in the page count everywhere', () => {
    const prompt = buildPrompt('professional', '')
    assert.doesNotMatch(prompt, /\{\{|\$\{/)
    assert.ok(prompt.includes('Exactly 4 pages: \\pagebreak after each of the first 3 pages.'))
  })

  it('should describe only the requested CV type', () => {
    assert.ok(buildPrompt('professional', '').includes('write the body of a LuaLaTeX Professional CV: quantified impact'))
    assert.ok(!buildPrompt('professional', '').includes('Anti-CV'))
    assert.ok(buildPrompt('anti', '').includes('write the body of a LuaLaTeX Anti-CV: failures'))
    assert.ok(!buildPrompt('anti', '').includes('Professional CV'))
  })

  it('should put the instructions after the career data and ask for the body only', () => {
    const prompt = buildPrompt('anti', 'CAREER')
    assert.ok(prompt.indexOf('CAREER') < prompt.indexOf('From this career data'))
    assert.ok(prompt.endsWith('Output: the document body only, from \\begin{document} to \\end{document}.'))
  })

  it('should keep LaTeX commands as single backslashes', () => {
    assert.ok(buildPrompt('anti', '').includes('Page 1: \\cvheader, CV summary'))
    assert.ok(buildPrompt('anti', '').includes('No vertical spacing commands (\\vspace, \\vfill, \\newpage)'))
    assert.ok(buildPrompt('anti', '').includes('Heading titles: text, font commands and \\hfill only.'))
    assert.ok(buildPrompt('anti', '').includes('Start the body with \\hypersetup{pdftitle={...},pdfauthor={...}}.'))
    assert.ok(buildPrompt('anti', '').includes('Symbols in text mode (\\texttimes, \\textrightarrow'))
  })
})

import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {PREAMBLE} from '../latex.ts'
import {buildPrompt} from '../prompts.ts'

describe('buildPrompt', () => {
  it('should embed the career data and the preamble verbatim', () => {
    const careerData = '# Career\nCut costs by $&5k; templating {{PAGES}} stays verbatim'
    const prompt = buildPrompt('anti', careerData)
    assert.ok(prompt.includes(`\`\`\`markdown\n${careerData}\n\`\`\``))
    assert.ok(prompt.includes(`\`\`\`latex\n${PREAMBLE}\n\`\`\``))
  })

  for (const [cvType, pages, budget] of [['professional', 4, '20,000'], ['anti', 2, '10,000']] as const) {
    it(`should lay out ${pages} pages for the ${cvType} CV`, () => {
      const prompt = buildPrompt(cvType, '')
      assert.ok(prompt.includes(`Exactly ${pages} pages`))
      assert.ok(prompt.includes(`the body about ${budget}`))
      assert.ok(prompt.includes(`Page ${pages}: `) && !prompt.includes(`Page ${pages + 1}: `))
      assert.doesNotMatch(prompt, /\$\{|\\\\[a-z]/)
    })
  }

  it('should describe only the requested CV type', () => {
    assert.ok(!buildPrompt('professional', '').includes('Anti-CV'))
    assert.ok(!buildPrompt('anti', '').includes('Professional CV'))
  })

  it('should put the instructions after the career data and ask for the body only', () => {
    const prompt = buildPrompt('anti', 'CAREER')
    assert.ok(prompt.indexOf('CAREER') < prompt.indexOf('From this career data'))
    assert.ok(prompt.endsWith('Output: the document body only, from \\begin{document} to \\end{document}.'))
  })
})

import {describe, expect, it} from 'vitest'
import {buildPrompt} from '../prompts.js'

describe('buildPrompt', () => {
  const careerData = '# Career\nCut costs by $&5k; templating {{PAGES}} stays verbatim'

  it.each(['professional', 'anti'] as const)('should embed the career data verbatim for the %s CV', cvType => {
    expect(buildPrompt(cvType, careerData)).toContain(`\`\`\`markdown\n${careerData}\n\`\`\``)
  })

  it('should fill in the page count everywhere', () => {
    const prompt = buildPrompt('professional', '')
    expect(prompt).not.toMatch(/\{\{|\$\{/)
    expect(prompt).toContain('Create exactly 4-page Professional CV')
    expect(prompt).toContain('Exactly 4 vertical, filled, dense pages.')
  })

  it('should use the instructions of the requested CV type', () => {
    expect(buildPrompt('professional', '')).toContain('Use metrics, percentages, concrete numbers.')
    expect(buildPrompt('professional', '')).not.toContain('Anti-CV')
    expect(buildPrompt('anti', '')).toContain('self-deprecating humor')
    expect(buildPrompt('anti', '')).not.toContain('Professional CV')
  })

  it('should keep LaTeX commands as single backslashes', () => {
    expect(buildPrompt('anti', '')).toContain('Use \\newpage after each page.')
  })
})

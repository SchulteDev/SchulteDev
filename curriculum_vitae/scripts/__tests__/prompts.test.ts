import {describe, expect, it} from 'vitest'

describe('prompts', () => {
  it('should handle placeholder substitution', () => {
    const template = "Create {{CV_TYPE}} from {{CAREER_DATA}}"

    const result = template
    .replace('{{CV_TYPE}}', 'professional CV')
    .replace('{{CAREER_DATA}}', 'sample data')

    expect(result).toBe('Create professional CV from sample data')
    expect(result).not.toContain('{{')
  })

  it('should identify placeholders', () => {
    const template = "Update {{CV_TYPE}} with {{DIFF_DATA}}"
    const placeholders = template.match(/\{\{[^{}]*}}/g)

    expect(placeholders).toEqual(['{{CV_TYPE}}', '{{DIFF_DATA}}'])
  })
})

describe('prompt builders', () => {
  it('should fill every placeholder of the incremental prompt', async () => {
    const {getIncrementalPrompt} = await import('../prompts.js')
    const prompt = getIncrementalPrompt('professional', 'CURRENT-CV-MARKER', 'DIFF-MARKER')

    expect(prompt).toContain('CURRENT-CV-MARKER')
    expect(prompt).toContain('DIFF-MARKER')
    expect(prompt).not.toMatch(/\{\{[A-Z_]+}}/)
  })

  it('should fill every placeholder of the full rebuild prompt', async () => {
    const {getFullRebuildPrompt} = await import('../prompts.js')
    const prompt = getFullRebuildPrompt('anti', 'CAREER-MARKER')

    expect(prompt).toContain('CAREER-MARKER')
    expect(prompt).not.toMatch(/\{\{[A-Z_]+}}/)
  })

  it('should insert values verbatim, without interpreting $ replacement patterns', async () => {
    const {getIncrementalPrompt} = await import('../prompts.js')
    const latex = String.raw`$$E = mc^2$$ costs \$5 $& $' $1`
    const prompt = getIncrementalPrompt('professional', latex, 'diff')

    expect(prompt).toContain(latex)
  })
})

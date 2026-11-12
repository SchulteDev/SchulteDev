import {describe, expect, it} from 'vitest'

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

  it('should insert values verbatim, without $ patterns or placeholders inside them being replaced', async () => {
    const {getIncrementalPrompt} = await import('../prompts.js')
    const latex = String.raw`$$E = mc^2$$ costs \$5 $& $' $1 {{CV_TYPE}} {{PAGES}}`
    const prompt = getIncrementalPrompt('professional', latex, 'diff')

    expect(prompt).toContain(latex)
  })
})

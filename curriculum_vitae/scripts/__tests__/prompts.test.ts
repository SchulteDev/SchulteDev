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
    const placeholders = template.match(/\{\{[^}]+\}\}/g)

    expect(placeholders).toEqual(['{{CV_TYPE}}', '{{DIFF_DATA}}'])
  })
})

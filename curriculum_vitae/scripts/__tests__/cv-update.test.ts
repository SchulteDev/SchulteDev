import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {updateCv} from '../cv-update.js'

const document = `\\documentclass{article}\n\\begin{document}\n${'x'.repeat(600)}\n\\end{document}`

describe('updateCv', () => {
  let cvFile: string

  beforeEach(() => {
    cvFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-update-')), 'cv.tex')
    fs.writeFileSync(cvFile, 'old CV')
  })

  afterEach(() => fs.rmSync(path.dirname(cvFile), {recursive: true}))

  it('should prompt with the career data and write the extracted LaTeX', async () => {
    const generate = vi.fn(async () => `Sure!\n\`\`\`latex\n${document}\n\`\`\``)

    await updateCv('anti', 'Fell off a cloud in 2019', generate, cvFile)

    expect(generate).toHaveBeenCalledWith(expect.stringContaining('Fell off a cloud in 2019'), 'anti')
    expect(generate).toHaveBeenCalledWith(expect.stringContaining('Anti-CV'), 'anti')
    expect(fs.readFileSync(cvFile, 'utf8')).toBe(document)
  })

  it('should keep the current CV when the answer is no LaTeX document', async () => {
    await expect(updateCv('professional', '', async () => 'Sorry', cvFile)).rejects.toThrow(/no complete LaTeX document/)

    expect(fs.readFileSync(cvFile, 'utf8')).toBe('old CV')
  })

  it('should keep the current CV when generation fails', async () => {
    const generate = async () => {
      throw new Error('API down')
    }

    await expect(updateCv('professional', '', generate, cvFile)).rejects.toThrow('API down')
    expect(fs.readFileSync(cvFile, 'utf8')).toBe('old CV')
  })
})

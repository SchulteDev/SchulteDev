import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type Anthropic from '@anthropic-ai/sdk'
import type {Message} from '@anthropic-ai/sdk/resources'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {getCvFile} from '../config.js'
import {claudeGenerator, LOG_DIR, reuseCommittedCv, updateCv} from '../cv-update.js'
import {extractLatex} from '../latex.js'

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

describe('claudeGenerator', () => {
  const logFile = `${LOG_DIR}/claude-response-anti.json`
  const clientAnswering = (text: string, stopReason: string) => ({
    messages: {
      stream: () => ({
        finalMessage: async () => ({
          content: [{type: 'text', text, citations: null}],
          stop_reason: stopReason,
          stop_details: null,
          usage: {input_tokens: 5, output_tokens: 10},
        }) as unknown as Message
      })
    }
  }) as unknown as Anthropic

  afterEach(() => fs.rmSync(logFile, {force: true}))

  it('should return the answer text and log the response', async () => {
    const generate = claudeGenerator(clientAnswering(document, 'end_turn'))

    await expect(generate('the prompt', 'anti')).resolves.toBe(document)
    const log = JSON.parse(fs.readFileSync(logFile, 'utf8'))
    expect(log.prompt).toBe('the prompt...')
    expect(log.message.usage).toEqual({input_tokens: 5, output_tokens: 10})
  })

  it('should log a truncated response before failing', async () => {
    const generate = claudeGenerator(clientAnswering('\\documentclass{art', 'max_tokens'))

    await expect(generate('the prompt', 'anti')).rejects.toThrow(/truncated/)
    expect(JSON.parse(fs.readFileSync(logFile, 'utf8')).message.stop_reason).toBe('max_tokens')
  })
})

describe('reuseCommittedCv', () => {
  it.each(['professional', 'anti'] as const)('should answer with the committed %s CV', async cvType => {
    const answer = await reuseCommittedCv('ignored', cvType)

    expect(answer).toBe(fs.readFileSync(getCvFile(cvType), 'utf8'))
    // The committed CVs pass extraction unchanged, so a SKIP_API run is a no-op
    expect(extractLatex(answer)).toBe(answer)
  })
})

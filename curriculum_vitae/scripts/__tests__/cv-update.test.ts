import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, it, mock} from 'node:test'
import {type CvType, getCvFile} from '../config.ts'
import {claudeGenerator, LOG_DIR, reuseCommittedCv, updateCv} from '../cv-update.ts'
import {extractLatex, tagged} from '../latex.ts'
import {fakeClient, fakeMessage} from './fakes.ts'

const document = `\\documentclass{article}\n\\begin{document}\n${'x'.repeat(600)}\n\\end{document}`

describe('updateCv', () => {
  let cvFile: string

  beforeEach(() => {
    cvFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cv-update-')), 'cv.tex')
    fs.writeFileSync(cvFile, 'old CV')
  })

  afterEach(() => fs.rmSync(path.dirname(cvFile), {recursive: true}))

  it('should prompt with the career data and write the extracted LaTeX as a tagged document', async () => {
    const generate = mock.fn(async (_prompt: string, _cvType: CvType) => `Sure!\n\`\`\`latex\n${document}\n\`\`\``)

    await updateCv('anti', 'Fell off a cloud in 2019', generate, cvFile)

    const [[prompt, cvType]] = generate.mock.calls.map(call => call.arguments)
    assert.ok(prompt.includes('Fell off a cloud in 2019'))
    assert.ok(prompt.includes('Anti-CV'))
    assert.equal(cvType, 'anti')
    assert.equal(fs.readFileSync(cvFile, 'utf8'), tagged(document))
  })

  it('should keep the current CV when the answer is no LaTeX document', async () => {
    await assert.rejects(updateCv('professional', '', async () => 'Sorry', cvFile), /no complete LaTeX document/)

    assert.equal(fs.readFileSync(cvFile, 'utf8'), 'old CV')
  })

  it('should keep the current CV when generation fails', async () => {
    const generate = async () => {
      throw new Error('API down')
    }

    await assert.rejects(updateCv('professional', '', generate, cvFile), /API down/)
    assert.equal(fs.readFileSync(cvFile, 'utf8'), 'old CV')
  })
})

describe('claudeGenerator', () => {
  const logFile = `${LOG_DIR}/claude-response-anti.json`
  const clientAnswering = (text: string, stopReason: string) =>
    fakeClient(async () => fakeMessage(text, stopReason)).client

  afterEach(() => fs.rmSync(logFile, {force: true}))

  it('should return the answer text and log the response', async () => {
    const generate = claudeGenerator(clientAnswering(document, 'end_turn'))

    assert.equal(await generate('the prompt', 'anti'), document)
    const log = JSON.parse(fs.readFileSync(logFile, 'utf8'))
    assert.equal(log.prompt, 'the prompt')
    assert.deepEqual(log.message.usage, {input_tokens: 5, output_tokens: 10})
  })

  it('should log only the start of a long prompt', async () => {
    await claudeGenerator(clientAnswering(document, 'end_turn'))('x'.repeat(300), 'anti')

    assert.equal(JSON.parse(fs.readFileSync(logFile, 'utf8')).prompt, `${'x'.repeat(200)}...`)
  })

  it('should log a truncated response before failing', async () => {
    const generate = claudeGenerator(clientAnswering('\\documentclass{art', 'max_tokens'))

    await assert.rejects(generate('the prompt', 'anti'), /truncated/)
    assert.equal(JSON.parse(fs.readFileSync(logFile, 'utf8')).message.stop_reason, 'max_tokens')
  })
})

describe('reuseCommittedCv', () => {
  for (const cvType of ['professional', 'anti'] as const) {
    it(`should answer with the committed ${cvType} CV, which an update keeps unchanged`, async () => {
      const answer = await reuseCommittedCv('ignored', cvType)

      assert.equal(answer, fs.readFileSync(getCvFile(cvType), 'utf8'))
      assert.equal(tagged(extractLatex(answer)), answer)
    })
  }
})

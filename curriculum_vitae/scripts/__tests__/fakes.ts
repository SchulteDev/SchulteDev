import {mock} from 'node:test'
import type Anthropic from '@anthropic-ai/sdk'
import type {Message} from '@anthropic-ai/sdk/resources'

export const fakeMessage = (text: string, stopReason: string, stopDetails: unknown = null) => ({
  content: [{type: 'thinking', thinking: '', signature: 'sig'}, {type: 'text', text, citations: null}],
  stop_reason: stopReason,
  stop_details: stopDetails,
  usage: {input_tokens: 5, output_tokens: 10},
}) as unknown as Message

export const fakeClient = (finalMessage: () => Promise<Message>) => {
  const stream = mock.fn((_request: unknown) => ({finalMessage}))
  return {stream, client: {messages: {stream}} as unknown as Anthropic}
}

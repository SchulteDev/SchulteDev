// claude.ts - Claude API request and response handling

import Anthropic from '@anthropic-ai/sdk';
import type {Message, MessageStreamParams, TextBlock} from '@anthropic-ai/sdk/resources';
import {API_EFFORT, API_MODEL, MAX_TOKENS} from './config.js';

export const createApiRequest = (prompt: string): MessageStreamParams => ({
  model: API_MODEL,
  max_tokens: MAX_TOKENS,
  messages: [{role: 'user', content: prompt}],
  thinking: {type: 'adaptive'},
  output_config: {effort: API_EFFORT},
});

/** Streams the request (required for long outputs) and returns the final message */
export const sendPrompt = async (prompt: string, client: Pick<Anthropic, 'messages'> = new Anthropic()):
  Promise<Message> => {
  try {
    return await client.messages.stream(createApiRequest(prompt)).finalMessage();
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      const status = error.status ?? 'no status';
      throw new Error(`Claude API error (${status}, request ID ${error.requestID ?? 'n/a'}): ${error.message}`,
        {cause: error});
    }
    throw error;
  }
};

/** Joins the text blocks (thinking blocks are separate); throws unless the answer is complete and non-empty */
export const getCompleteText = (message: Message): string => {
  const {stop_reason: stopReason, stop_details: stopDetails} = message;
  if (stopReason === 'refusal') {
    const explanation = stopDetails?.explanation ? `: ${stopDetails.explanation}` : '';
    throw new Error(`Claude declined the request (refusal, ${stopDetails?.category ?? 'unknown category'})${explanation}`);
  }
  if (stopReason === 'max_tokens') {
    throw new Error(`Response was truncated at MAX_TOKENS=${MAX_TOKENS}`);
  }
  if (stopReason !== 'end_turn') {
    throw new Error(`Response is incomplete (stop reason: ${stopReason})`);
  }

  const text = message.content
    .filter((block): block is TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');
  if (!text.trim()) {
    throw new Error('Response is empty');
  }
  return text;
};

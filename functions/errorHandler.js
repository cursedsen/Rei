import { sendMessage } from './reiMessageMaker.js';
import { DiscordAPIError } from 'discord.js';

export async function handleError(error, message) {
  console.error('Error occurred:', error);

  if (!message?.channel) return;

  if (error instanceof DiscordAPIError) {
    const errorMessages = {
      50001: 'I lack access to this channel.',
      50013: 'I don\'t have the required permissions to perform this action.',
      50007: 'Cannot send messages to this user (they may have DMs disabled).',
      10003: 'The specified channel does not exist.',
      10004: 'The specified guild does not exist.',
      10013: 'The specified user does not exist.',
    };

    const errorMessage = errorMessages[error.code] || 'An unexpected Discord API error occurred.';

    await sendMessage(message, {
      title: 'Error',
      description: `${errorMessage}\nError Code: ${error.code}`,
      color: 0xFF0000
    }).catch(() => { });
    return;
  }
  if (error.name === 'DiscordAPIError[50013]') {
    await sendMessage(message, {
      title: 'Permission Error',
      description: 'I don\'t have the required permissions to perform this action. Please check my role permissions.',
      color: 0xFF0000
    }).catch(() => { });
    return;
  }
  if (error instanceof TypeError) {
    await sendMessage(message, {
      title: 'Invalid Input',
      description: 'Invalid usage of command. Please use the correct syntax.',
      color: 0xFF0000
    }).catch(() => { });
    return;
  }
  if (error.name === 'RateLimitError') {
    await sendMessage(message, {
      title: 'Rate Limited',
      description: 'This action is being rate limited. Please try again later.',
      color: 0xFF0000
    }).catch(() => { });
    return;
  }
  if (error.name === 'SqliteError') {
    await sendMessage(message, {
      title: 'Database Error',
      description: 'An error occurred while accessing the database. Please try again later.',
      color: 0xFF0000
    }).catch(() => { });
    return;
  }

  await sendMessage(message, {
    title: 'Error',
    description: 'An unexpected error occurred while processing your request.',
    color: 0xFF0000
  }).catch(() => { });
}

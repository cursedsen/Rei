import { handleStarboard } from '../functions/msgBoard.js';

export default {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Error fetching reaction:', error);
        return;
      }
    }

    await handleStarboard(reaction, user);
  }
}; 
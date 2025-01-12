import { handleStarboard } from '../functions/msgboard.js';

export default {
  name: 'messageReactionAdd',
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
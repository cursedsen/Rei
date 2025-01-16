import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'description',
  description: 'Update channel description/topic',
  category: 'moderation',
  permissions: ['ManageChannels'],
  usage: '<description>',
  aliases: ['desc', 'topic'],

  async execute(message, args) {
    if (!args.length) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a new description for the channel.',
        color: 0xFF0000
      });
    }

    const newDescription = args.join(' ');

    try {
      await message.channel.setTopic(newDescription);

      await sendMessage(message, {
        content: `Channel description changed to ***${newDescription}***`,
      });

    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        title: 'Error',
        description: 'Failed to update channel description. Make sure I have the correct permissions.',
        color: 0xFF0000
      });
    }
  }
};
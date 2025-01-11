import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'purge',
  description: 'Purge a specified amount of messages from the channel.',
  category: 'fun',
  permissions: ['ManageMessages'],
  usage: '<amount>',
  aliases: ['clear', 'delete'],
  execute: async (message, args) => {
    const amount = parseInt(args[0]);

    if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a valid number between 1 and 1000.',
        color: 0xFF0000,
      });
    }

    try {
      await message.delete();
      let totalDeleted = 0;
      while (totalDeleted < amount) {
        const deleteAmount = Math.min(100, amount - totalDeleted);
        const deleted = await message.channel.bulkDelete(deleteAmount, true);
        if (deleted.size === 0) break;
        totalDeleted += deleted.size;
      }

      const tempMessage = await sendMessage(message, {
        title: 'Done👍',
        description: `Successfully deleted ${totalDeleted} messages.`,
        color: 0x00FF00,
        timestamp: true,
      });

      setTimeout(() => {
        tempMessage.delete().catch(() => { });
      }, 5000);

    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        title: 'Error',
        description: 'Failed to delete messages.',
        color: 0xFF0000,
      });
    }
  }
};

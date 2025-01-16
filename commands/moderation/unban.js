import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
  name: 'unban',
  description: 'Unban a user',
  category: 'moderation',
  permissions: ['BanMembers'],
  usage: '<user> [reason]',
  execute: async (message, args) => {
    if (!args[0]) {
      return await sendMessage(message, {
        content: 'Please provide a valid user tag or ID to unban.'
      });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    let target = message.mentions.users.first();

    if (!target) {
      try {
        target = await message.client.users.fetch(args[0]);
      } catch (err) {
        return await sendMessage(message, {
          content: 'Could not find that user.'
        });
      }
    }

    if (target.id === message.author.id) {
      return await sendMessage(message, {
        content: 'Nice try.',
      });
    }

    try {
      await message.guild.bans.remove(target, reason);

      await sendMessage(message, {
        content: `${target.tag} was unbanned.`
      });

      await logModAction(message, 'unban', target, reason);
    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        content: 'Could not find that user or they are not banned.'
      });
    }
  }
};

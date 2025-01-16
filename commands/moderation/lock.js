import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';
import { LOCKED, OK } from 'sqlite3';

export default {
  name: 'lock',
  description: 'Lock the channel for everyone',
  category: 'moderation',
  permissions: ['ManageChannels'],
  usage: '[reason]',
  async execute(message, args) {
    const reason = args.join(' ') || 'No reason provided';

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      await sendMessage(message, {
        content: `Ok, channel locked`
      });

      await logModAction(message, 'lock', null, `Channel: ${message.channel.name} | ${reason}`);
    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        title: 'Error',
        description: 'Failed to lock the channel. Make sure I have the correct permissions.',
        color: 0xFF0000
      });
    }
  }
};

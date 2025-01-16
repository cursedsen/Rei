import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
  name: 'addnote',
  description: 'Add a note to a user\'s record',
  category: 'moderation',
  permissions: ['ModerateMembers'],
  usage: '<user> <note>',
  execute: async (message, args) => {
    if (!args[0]) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a valid user tag or ID to add a note to.',
        color: 0xFF0000,
      });
    }

    if (!args[1]) {
      return await sendMessage(message, {
        content: 'Please provide a note to add.'
      });
    }

    let target = message.mentions.members.first() ||
      await message.guild.members.fetch(args[0]).catch(() => null);

    let userId, userTag, userAvatar;

    if (!target) {
      try {
        const user = await message.client.users.fetch(args[0]);
        userId = user.id;
        userTag = user.tag;
        userAvatar = user.displayAvatarURL();

        const note = args.slice(1).join(' ');
        await logModAction(message, 'note', user, note);

        await sendMessage(message, {
          content: `Ok, added note to ${userTag}'s record.`
        });
        return;
      } catch (err) {
        return await sendMessage(message, {
          content: 'Could not find that user.'
        });
      }
    }

    const note = args.slice(1).join(' ');
    await logModAction(message, 'note', target.user, note);

    await sendMessage(message, {
      content: `Ok, added note to ${target.user.tag}'s record.`
    });
  }
}; 
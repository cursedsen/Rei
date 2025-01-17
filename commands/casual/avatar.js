import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'avatar',
  description: 'Shows the avatar of a user.',
  category: 'casual',
  usage: 'avatar [main/server] [user]',
  aliases: ['av', 'pfp', 'profilepicture'],
  async execute(message, args) {
    let user, member;
    const type = args[0]?.toLowerCase();

    if (type === 'main' || type === 'server') {
      user = message.mentions.users.first() || 
        await message.client.users.fetch(args[1]).catch(() => null) ||
        message.author;
    } else {
      user = message.mentions.users.first() || 
        await message.client.users.fetch(args[0]).catch(() => null) ||
        message.author;
    }

    member = message.mentions.members.first() ||
      await message.guild.members.fetch(user.id).catch(() => null);

    let avatarUrl;
    if (type === 'main') {
      avatarUrl = user.displayAvatarURL({ size: 4096 });
    } else if (type === 'server' && member) {
      avatarUrl = member.displayAvatarURL({ size: 4096 });
    } else {
      avatarUrl = member?.avatarURL({ size: 4096 }) || user.displayAvatarURL({ size: 4096 });
    }

    await sendMessage(message, {
      embeds: [{
        title: `${user.displayName}'s Avatar`,
        image: {
          url: avatarUrl
        },
        color: 0x2B2D31
      }]
    });
  }
};

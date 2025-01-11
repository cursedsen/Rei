import { sendMessage } from '../../functions/reiMessageMaker.js';

export default {
  name: 'avatar',
  description: 'Shows the avatar of a user.',
  category: 'casual',
  usage: 'avatar [main/server] [user]',
  aliases: ['av', 'pfp', 'profilepicture'],
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.mentions.members.first() || message.member;

    let avatarUrl;
    const type = args[0]?.toLowerCase();

    if (type === 'main') {
      avatarUrl = user.displayAvatarURL({ size: 4096 });
    } else if (type === 'server') {
      avatarUrl = member.displayAvatarURL({ size: 4096 });
    } else {
      avatarUrl = member.avatarURL({ size: 4096 }) || user.displayAvatarURL({ size: 4096 });
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

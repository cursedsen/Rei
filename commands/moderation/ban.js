import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';
import { User } from 'discord.js';
import { readFileSync } from 'fs';

export default {
  name: 'ban',
  description: 'Ban a user',
  category: 'moderation',
  permissions: ['BanMembers'],
  usage: '<user> [reason]',
  execute: async (message, args) => {
    if (!args[0]) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'Please provide a valid user tag or ID to ban.',
        color: 0xFF0000,
      });
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const deletionKeywords = [
      'nsfw', 'n.s.f.w', 'n s f w', 'explicit',
      'porn', 'p0rn', 'pr0n', 'adult content',
      'gore', 'g0re', 'graphic', 'blood',
      'raid', 'r4id', 'ra1d', 'attack',
      'scam', 'sc4m', 'fraud', 'phishing',
      'advertising', 'ads', 'spam', 'promo'
    ];

    const shouldDeleteMessages = deletionKeywords.some(keyword =>
      reason.toLowerCase().includes(keyword.toLowerCase())
    );

    let target = message.mentions.members.first() ||
      await message.guild.members.fetch(args[0]).catch(() => null);

    let userId, userTag, userAvatar;

    if (!target) {
      try {
        const user = await message.client.users.fetch(args[0]);
        userId = user.id;
        userTag = user.tag;
        userAvatar = user.displayAvatarURL();

        try {
          if (shouldDeleteMessages) {
            const sixHoursAgo = new Date(Date.now() - (6 * 60 * 60 * 1000));
            const messages = await message.channel.messages.fetch({
              limit: 100,
              before: message.id
            });
            const userMessages = messages.filter(m =>
              m.author.id === user.id &&
              m.createdAt > sixHoursAgo
            );
            if (userMessages.size > 0) {
              await message.channel.bulkDelete(userMessages);
            }
          }

          await message.guild.bans.create(user, { reason: reason });

          const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
          const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

          await sendMessage(message, {
            content: `${userTag} was ${funnyRandomAction}`,
          });

          await logModAction(message, 'ban', user, reason);
          return;
        } catch (error) {
          console.error(error);
          return await sendMessage(message, {
            title: 'Error',
            description: 'An error occurred while trying to ban the user.',
            color: 0xFF0000,
          });
        }
      } catch (err) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'Could not find that user.',
          color: 0xFF0000,
        });
      }
    }

    if (target.id === message.author.id) {
      return await sendMessage(message, {
        content: 'Nice try.',
      });
    }

    if (!target.moderatable) {
      return await sendMessage(message, {
        title: 'Error',
        description: 'I cannot ban this user. They may have higher permissions than me.',
        color: 0xFF0000,
      });
    }

    try {
      if (shouldDeleteMessages) {
        const sixHoursAgo = new Date(Date.now() - (6 * 60 * 60 * 1000));
        const messages = await message.channel.messages.fetch({
          limit: 100,
          before: message.id
        });
        const userMessages = messages.filter(m =>
          m.author.id === target.id &&
          m.createdAt > sixHoursAgo
        );
        if (userMessages.size > 0) {
          await message.channel.bulkDelete(userMessages);
        }
      }

      await target.ban({ reason: reason });

      const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
      const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

      await sendMessage(message, {
        content: `${target.user.tag} was ${funnyRandomAction}`,
      });

      await logModAction(message, 'ban', target.user, reason);
    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        title: 'Error',
        description: 'An error occurred while trying to ban the user.',
        color: 0xFF0000,
      });
    }
  }
};

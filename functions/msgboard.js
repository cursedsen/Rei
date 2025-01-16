import { sendMessage } from './reiMessageMaker.js';
import { getServerConfig } from './serverConfig.js';

export const starboardCache = new Map();

export async function handleStarboard(reaction, user) {
  try {
    if (user.bot) return;

    const message = reaction.message;
    if (!message.guild) return;

    const config = await getServerConfig(message.guild.id);

    if (!config.starboard_channel || !config.starboard_threshold) {
      return;
    }

    const starboardChannel = message.guild.channels.cache.get(config.starboard_channel);
    if (!starboardChannel) {
      return;
    }

    const validEmojis = ['⭐', '🌟', '✨', '🔥', '🐟'];

    if (!validEmojis.includes(reaction.emoji.name)) {
      return;
    }

    const starCount = validEmojis.reduce((count, emoji) => {
      const reactions = message.reactions.cache.get(emoji);
      return count + (reactions ? reactions.count : 0);
    }, 0);

    const existingStarMessage = starboardCache.get(message.id);

    if (starCount < config.starboard_threshold && !existingStarMessage) {
      return;
    }

    if (starCount < config.starboard_threshold && existingStarMessage) {
      try {
        const starMessage = await starboardChannel.messages.fetch(existingStarMessage);
        if (starMessage) {
          await starMessage.delete();
          starboardCache.delete(message.id);
        }
      } catch (err) {
        console.error('Failed to delete starboard message:', err);
      }
      return;
    }

    const messageOptions = {
      content: `${reaction.emoji.name} ${starCount} ${message.channel}`,
      description: [
        message.content || '*No text content*',
        '',
        `[Jump to message](${message.url})`
      ].join('\n'),
      color: 0xFFAC33,
      author: {
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL()
      },
      footer: {
        text: message.id
      },
      timestamp: message.createdAt
    };

    const attachment = message.attachments.first();
    if (attachment && attachment.contentType?.startsWith('image/')) {
      messageOptions.image = attachment.url;
    }

    if (!messageOptions.image && message.embeds?.length > 0) {
      const tenorEmbed = message.embeds.find(e => e.data.provider?.name === "Tenor");
      if (tenorEmbed?.data.thumbnail?.url) {
        const tenorMatch = /^https:\/\/media\.tenor\.com\/([a-zA-Z0-9_-]+)e\/[a-zA-Z0-9_-]+\.png$/;
        const match = tenorEmbed.data.thumbnail.url.match(tenorMatch);
        if (match) {
          messageOptions.image = `https://c.tenor.com/${match[1]}C/tenor.gif`;
        }
      }
    }

    const sanitizedContent = message.content?.replace(/@(everyone|here|&\d+)/g, '@\u200b$1') || '*No text content*';

    messageOptions.description = [
      sanitizedContent,
      '',
      `[Jump to message](${message.url})`
    ].join('\n');

    try {
      if (existingStarMessage) {
        const starMessage = await starboardChannel.messages.fetch(existingStarMessage);
        if (starMessage) {
          await starMessage.edit({
            content: messageOptions.content,
            embeds: [{
              description: messageOptions.description,
              color: messageOptions.color,
              author: messageOptions.author,
              footer: messageOptions.footer,
              timestamp: messageOptions.timestamp,
              image: messageOptions.image ? { url: messageOptions.image } : null
            }]
          });
        }
      } else {
        const starMessage = await sendMessage(starboardChannel, messageOptions);
        if (starMessage) {
          starboardCache.set(message.id, starMessage.id);
        }
      }
    } catch (err) {
      console.error('Failed to handle starboard message:', err);
      starboardCache.delete(message.id);
    }
  } catch (error) {
    console.error('Starboard error:', error);
  }
}
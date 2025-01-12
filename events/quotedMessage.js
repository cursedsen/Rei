import { sendMessage } from '../functions/reiMessageMaker.js';

export default {
  name: 'messageCreate',
  async execute(message) {
    if (!message.guild) return;

    const matches = message.content.match(/https?:\/\/(?:.*)?(?:discord\.com|discordapp\.com)\/channels\/(\d+)\/(\d+)\/(\d+)/g);
    if (!matches) return;

    for (const url of matches) {
      try {
        const [_, guildId, channelId, messageId] = url.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
        if (guildId !== message.guild.id) continue;

        const channel = await message.guild.channels.fetch(channelId);
        if (!channel) continue;

        const quote = await channel.messages.fetch(messageId);
        if (!quote) continue;

        const messageOptions = {
          description: [
            quote.content || '*No text content*',
            '',
            `[Jump to message](${quote.url})`
          ].join('\n'),
          color: 0x2B2D31,
          author: {
            name: quote.author.tag,
            iconURL: quote.author.displayAvatarURL()
          },
          footer: {
            text: `Quoted by ${message.author.tag}`
          },
          timestamp: quote.createdAt
        };

        const attachment = quote.attachments.first();
        if (attachment && attachment.contentType?.startsWith('image/')) {
          messageOptions.image = attachment.url;
        }

        if (!messageOptions.image && quote.embeds?.length > 0) {
          const tenorEmbed = quote.embeds.find(e => e.data.provider?.name === "Tenor");
          if (tenorEmbed?.data.thumbnail?.url) {
            const tenorMatch = /^https:\/\/media\.tenor\.com\/([a-zA-Z0-9_-]+)e\/[a-zA-Z0-9_-]+\.png$/;
            const match = tenorEmbed.data.thumbnail.url.match(tenorMatch);
            if (match) {
              messageOptions.image = `https://c.tenor.com/${match[1]}C/tenor.gif`;
            }
          }
        }

        await sendMessage(message.channel, messageOptions);

      } catch (error) {
        console.error('Error handling quote:', error);
      }
    }
  }
};

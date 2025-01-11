import { getServerConfig } from "../functions/serverConfig.js";
import { handleError } from "../functions/errorHandler.js";

export default {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    if (
      oldMessage.author?.bot ||
      !oldMessage.guild ||
      oldMessage.content === newMessage.content
    )
      return;

    const timestamp = new Date();
    const serverConfig = await getServerConfig(oldMessage.guild.id);
    const logChannel = oldMessage.guild.channels.cache.get(
      serverConfig.log_channel_edits
    );

    if (!logChannel) return;

    try {
      await logChannel.send({
        embeds: [
          {
            title: "✏️ Message Edited",
            description:
              `**Original message posted on**\n${oldMessage.createdAt.toUTCString()}\n` +
              `(<t:${Math.floor(
                oldMessage.createdTimestamp / 1000
              )}:R>)\n\n` +
              `**Author**\n<@${oldMessage.author.id}> | ${oldMessage.author.tag}\n\`\`\`${oldMessage.author.id}\`\`\`\n` +
              `**Message Location**\n${oldMessage.channel}${oldMessage.reference
                ? ` | [In reply to](https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.reference.messageId})`
                : " | "
              }` +
              `[Jump to Message](${oldMessage.url})\n\n` +
              `**Before**\n${oldMessage.content || "No text content"
              }\n\n` +
              `**After**\n${newMessage.content || "No text content"
              }`,
            color: 0x2B2D31,
            footer: {
              text: `Rei 1.4.2 • ${timestamp.toUTCString()}`,
            },
          },
        ],
      });
    } catch (error) {
      await handleError(error, oldMessage);
    }
  },
};

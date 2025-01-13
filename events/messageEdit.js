import { getServerConfig } from "../functions/serverConfig.js";
import { handleError } from "../functions/errorHandler.js";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json')));

export default {
  name: "messageUpdate",
  async execute(oldMessage, newMessage) {
    try {
      if (oldMessage.partial) await oldMessage.fetch();
      if (newMessage.partial) await newMessage.fetch();

      if (
        !oldMessage?.author ||
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

      if (!logChannel) {
        console.warn(`Log channel not found for guild: ${oldMessage.guild.id}`);
        return;
      }

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
              `**Before**\n${oldMessage.content || "No text content"}\n\n` +
              `**After**\n${newMessage.content || "No text content"}`,
            color: 0x2B2D31,
            footer: {
              text: `Rei ${packageJson.version} • ${timestamp.toUTCString()}`,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error in messageUpdate handler:", error);
      await handleError(error, oldMessage);
    }
  },
};

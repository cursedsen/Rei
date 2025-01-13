import { getServerConfig } from "../functions/serverConfig.js";
import { PermissionsBitField } from "discord.js";
import { getVersion } from "../functions/version.js";

export default {
   name: "messageDelete",
   async execute(message) {
      if (message.author?.bot || !message.guild) return;

      const serverConfig = await getServerConfig(message.guild.id);
      const logChannel = message.guild.channels.cache.get(
         serverConfig.log_channel_deletions
      );

      if (!logChannel) return;

      if (
         !logChannel
            .permissionsFor(logChannel.client.user)
            .has(PermissionsBitField.Flags.SendMessages)
      ) {
         console.log(
            `Missing permissions to send messages in channel ${logChannel.name}`
         );
         return;
      }

      const timestamp = new Date();

      try {
         await logChannel.send({
            embeds: [
               {
                  title: "🗑️ Message Deleted",
                  description:
                     `**Original message posted on**\n${message.createdAt.toUTCString()}\n` +
                     `(<t:${Math.floor(
                        message.createdTimestamp / 1000
                     )}:R>)\n\n` +
                     `**Author**\n<@${message.author.id}> | ${message.author.tag}\n\`\`\`${message.author.id}\`\`\`\n` +
                     `**Message Location**\n${message.channel}${message.reference
                        ? ` | [In reply to](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.reference.messageId})`
                        : ""
                     }\n\n` +
                     `**Deleted Message**\n${message.content || "No text content"
                     }`,
                  color: 0xff0000,
                  footer: {
                    text: `Rei ${getVersion()} • ${timestamp.toUTCString()}`,
                  },
               },
            ],
         });
      } catch (error) {
         console.error("Failed to send message delete notification:", error);
      }
   },
};

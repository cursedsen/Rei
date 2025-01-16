import { getServerConfig } from "../functions/serverConfig.js";
import { getVersion } from "../functions/version.js";

export default {
  name: "userUpdate",
  async execute(oldUser, newUser) {
    if (oldUser.avatar === newUser.avatar &&
      oldUser.username === newUser.username &&
      oldUser.discriminator === newUser.discriminator &&
      oldUser.globalName === newUser.globalName) return;

    try {
      const guilds = newUser.client.guilds.cache.filter(guild =>
        guild.members.cache.has(newUser.id)
      );

      for (const guild of guilds.values()) {
        const serverConfig = await getServerConfig(guild.id);
        const logChannel = guild.channels.cache.get(serverConfig.log_channel_profiles);

        if (!logChannel) continue;

        const timestamp = new Date();
        const fields = [];

        if (oldUser.avatar !== newUser.avatar) {
          fields.push(
            {
              name: "Avatar updated",
              value: newUser.avatar ? "[View Here](" + newUser.displayAvatarURL({ size: 4096 }) + ")" : "None"
            });
        }

        if (oldUser.username !== newUser.username || oldUser.discriminator !== newUser.discriminator) {
          fields.push({
            name: "Username updated",
            value: `${oldUser.tag} → ${newUser.tag}`
          });
        }

        if (oldUser.globalName !== newUser.globalName) {
          fields.push({
            name: "Display name updated",
            value: `${oldUser.globalName || "*None*"} → ${newUser.globalName || "*None*"}`
          });
        }

        await logChannel.send({
          embeds: [{
            title: "Profile updated",
            description:
              `**User**\n<@${newUser.id}> | ${newUser.tag}\n\`\`\`${newUser.id}\`\`\`\n` +
              `**Timestamp**\n${timestamp.toUTCString()}\n(<t:${Math.floor(Date.now() / 1000)}:R>)`,
            color: 0x2B2D31,
            fields: fields,
            thumbnail: {
              url: newUser.displayAvatarURL({ size: 4096 })
            },
            footer: {
              text: `Rei ${getVersion()} • ${timestamp.toUTCString()}`
            }
          }]
        });
      }
    } catch (error) {
      console.error("Error in profile update handler:", error);
    }
  }
};
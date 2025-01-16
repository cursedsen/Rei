import { sendMessage } from "../../functions/reiMessageMaker.js";
import { updateServerConfig, getServerConfig } from "../../functions/serverConfig.js";
import { isBotMaster } from "../../config/botMasters.js";

export default {
	name: "config",
	description: "Configure server settings",
	category: "admin",
	permissions: ["Administrator"],
	async execute(message, args) {
		if (!message.member.permissions.has("Administrator") && !isBotMaster(message.author.id)) {
			return await sendMessage(message, {
				title: "Error",
				description:
					"You need Administrator permissions to use this command.",
				color: 0xff0000,
			});
		}

		if (!args[0]) {
			const config = await getServerConfig(message.guild.id);
			return await sendMessage(message, {
				title: "Server configuration",
				description: [
					"**Current Settings**",
					"",
					`**Join/Leave Logs**\n${config.log_channel_join_leave
						? `<#${config.log_channel_join_leave}>`
						: "`Not set`"
					}`,
					`**Mod Audit Logs**\n${config.log_channel_mod_audit
						? `<#${config.log_channel_mod_audit}>`
						: "`Not set`"
					}`,
					`**Edit Logs**\n${config.log_channel_edits
						? `<#${config.log_channel_edits}>`
						: "`Not set`"
					}`,
					`**Deletion Logs**\n${config.log_channel_deletions
						? `<#${config.log_channel_deletions}>`
						: "`Not set`"
					}`,
					`**Starboard Channel**\n${config.starboard_channel
						? `<#${config.starboard_channel}>`
						: "`Not set`"
					}`,
					`**Star Threshold**\n\`${config.starboard_threshold || "Not set"}\``,
					`**Profiles**\n${config.log_channel_profiles
						? `<#${config.log_channel_profiles}>`
						: "`Not set`"
					}`,
					`**Prefix**\n\`${config.prefix || "."}\``,
					"",
					"**Usage**",
					"`-config <setting> <value>`",
					"",
					"**Available Settings**",
					"`joinleave`, `modaudit`, `edits`, `deletions`, `profiles`, `prefix`, `starboard`, `starthreshold`",
				].join("\n"),
				color: 0x2b2d31,
			});
		}

		const setting = args[0].toLowerCase();
		const value = args[1];

		const settingMap = {
			joinleave: "log_channel_join_leave",
			modaudit: "log_channel_mod_audit",
			edits: "log_channel_edits",
			deletions: "log_channel_deletions",
			profiles: "log_channel_profiles",
			prefix: "prefix",
			starboard: "starboard_channel",
			starthreshold: "starboard_threshold",
		};

		if (!settingMap[setting]) {
			return await sendMessage(message, {
				title: "Error",
				description:
					"Invalid setting. Available settings: joinleave, modaudit, edits, deletions, profiles, prefix, starboard, starthreshold",
				color: 0xff0000,
			});
		}

		try {
			if (['joinleave', 'modaudit', 'edits', 'deletions', 'profiles', 'starboard'].includes(setting)) {
				const channel = message.mentions.channels.first() ||
					message.guild.channels.cache.get(value);

				if (!channel) {
					return await sendMessage(message, {
						title: "Error",
						description: "Please mention a valid channel or provide a channel ID.",
						color: 0xff0000,
					});
				}

				await updateServerConfig(message.guild.id, settingMap[setting], channel.id);
			}
			else if (setting === 'prefix') {
				await updateServerConfig(message.guild.id, settingMap[setting], value);
			}
			else if (setting === 'starthreshold') {
				const threshold = parseInt(value);
				if (isNaN(threshold) || threshold < 1) {
					return await sendMessage(message, {
						title: "Error",
						description: "Please provide a valid number greater than 0.",
						color: 0xff0000,
					});
				}
				await updateServerConfig(message.guild.id, settingMap[setting], threshold);
			}

			await sendMessage(message, {
				title: "Success",
				description: `Updated ${setting} setting.`,
				color: 0x57f287,
			});
		} catch (error) {
			console.error(error);
			await sendMessage(message, {
				title: "Error",
				description: "An error occurred while updating the configuration.",
				color: 0xff0000,
			});
		}
	},
};

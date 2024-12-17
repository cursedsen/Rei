import { getServerConfig } from '../functions/serverConfig.js';
import { handleError } from '../functions/errorHandler.js';

export default [
    {
        name: 'guildMemberAdd',
        async execute(member) {
            const config = await getServerConfig(member.guild.id);
            if (!config.log_channel_join_leave) return;

            const logChannel = member.guild.channels.cache.get(config.log_channel_join_leave);
            if (!logChannel) return;

            const timestamp = new Date();

            try {
                await logChannel.send({
                    embeds: [{
                        title: '📥 New Member',
                        description: `**User**\n<@${member.id}> | ${member.user.tag}\n\`${member.id}\`\n\n` +
                            `**Account Created**\n${member.user.createdAt.toUTCString()}\n` +
                            `(<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>)`,
                        color: 0x00FF00,
                        thumbnail: {
                            url: member.user.displayAvatarURL()
                        },
                        footer: {
                            text: `Event logged on ${timestamp.toUTCString()} • ${timestamp.toLocaleString()}`
                        }
                    }]
                });
            } catch (error) {
                await handleError(error, { channel: logChannel });
            }
        }
    },
    {
        name: 'guildMemberRemove',
        async execute(member) {
            const config = await getServerConfig(member.guild.id);
            if (!config.log_channel_join_leave) return;

            const logChannel = member.guild.channels.cache.get(config.log_channel_join_leave);
            if (!logChannel) return;

            const timestamp = new Date();
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: 20
            });
            const kickLog = fetchedLogs.entries.first();
            const executor = kickLog?.executor;
            const kickedBy = executor && kickLog.createdTimestamp > (Date.now() - 5000) ? 
                `\n\n**Kicked By**\n<@${executor.id}> | ${executor.tag}\n\`${executor.id}\`` : '';

            try {
                await logChannel.send({
                    embeds: [{
                        title: '📤 Member Left',
                        description: `**User**\n<@${member.id}> | ${member.user.tag}\n\`${member.id}\`\n\n` +
                            `**Joined Server**\n${member.joinedAt.toUTCString()}\n` +
                            `(<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)` +
                            kickedBy,
                        color: 0xFF0000,
                        thumbnail: {
                            url: member.user.displayAvatarURL()
                        },
                        footer: {
                            text: `Event logged on ${timestamp.toUTCString()} • ${timestamp.toLocaleString()}`
                        }
                    }]
                });
            } catch (error) {
                await handleError(error, { channel: logChannel });
            }
        }
    }
];


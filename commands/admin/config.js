import { sendMessage } from '../../functions/reiMessageMaker.js';
import { updateServerConfig, getServerConfig } from '../../functions/serverConfig.js';

export default {
    name: 'config',
    description: 'Configure server settings',
    category: 'admin',
    permissions: ['Administrator'],
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'You need Administrator permissions to use this command.',
                color: 0xFF0000
            });
        }

        if (!args[0]) {
            const config = await getServerConfig(message.guild.id);
            return await sendMessage(message, {
                title: 'Server Configuration',
                description: 'Current settings:\n\n' +
                    `Join/Leave Logs: ${config.log_channel_join_leave || 'Not set'}\n` +
                    `Mod Audit Logs: ${config.log_channel_mod_audit || 'Not set'}\n` +
                    `Edit Logs: ${config.log_channel_edits || 'Not set'}\n` +
                    `Deletion Logs: ${config.log_channel_deletions || 'Not set'}\n` +
                    `Prefix: ${config.prefix || '.'}\n\n` +
                    'To configure: `.config <setting> <value>`\n' +
                    'Available settings: joinleave, modaudit, edits, deletions, prefix',
                color: 0x00FF00
            });
        }

        const setting = args[0].toLowerCase();
        const value = args[1];

        const settingMap = {
            'joinleave': 'log_channel_join_leave',
            'modaudit': 'log_channel_mod_audit',
            'edits': 'log_channel_edits',
            'deletions': 'log_channel_deletions',
            'prefix': 'prefix'
        };

        if (!settingMap[setting]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Invalid setting. Available settings: joinleave, modaudit, edits, deletions, prefix',
                color: 0xFF0000
            });
        }

        try {
            if (setting !== 'prefix') {
                const channel = message.mentions.channels.first() || 
                    message.guild.channels.cache.get(value);
                
                if (!channel) {
                    return await sendMessage(message, {
                        title: 'Error',
                        description: 'Please mention a valid channel or provide a channel ID.',
                        color: 0xFF0000
                    });
                }
                
                await updateServerConfig(message.guild.id, settingMap[setting], channel.id);
            } else {
                await updateServerConfig(message.guild.id, 'prefix', value);
            }

            await sendMessage(message, {
                title: 'Success',
                description: `Updated ${setting} setting.`,
                color: 0x00FF00
            });
        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while updating the configuration.',
                color: 0xFF0000
            });
        }
    }
}; 
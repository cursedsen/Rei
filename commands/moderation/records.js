import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default {
    name: 'records',
    description: 'View moderation records for a user',
    category: 'moderation',
    permissions: ['ModerateMembers'],
    usage: '<user>',
    async execute(message, args) {
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a user mention or ID to look up.',
                color: 0xFF0000
            });
        }

        let target = message.mentions.members.first() || 
            await message.guild.members.fetch(args[0]).catch(() => null);

        let userId, userTag, userAvatar;

        if (!target) {
            try {
                const user = await message.client.users.fetch(args[0]);
                userId = user.id;
                userTag = user.tag;
                userAvatar = user.displayAvatarURL();
            } catch (err) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'Could not find that user.',
                    color: 0xFF0000
                });
            }
        } else {
            userId = target.id;
            userTag = target.user.tag;
            userAvatar = target.user.displayAvatarURL();
        }

        const db = await open({
            filename: './serverData/auditLogs.db',
            driver: sqlite3.Database
        });

        const records = await db.all(
            `SELECT * FROM audit_logs 
             WHERE target_user_name = ? 
             AND guild_id = ?
             ORDER BY timestamp DESC`,
            [userId, message.guild.id]
        );

        if (records.length === 0) {
            return await sendMessage(message, {
                title: 'Member Records',
                description: `**${userTag}**\n has no violations on record.`,
                color: 0x00FF00,
                thumbnail: userAvatar
            });
        }

        const emojis = {
            ban: '🔨',
            kick: '👢',
            mute: '🔇',
            unban: '🔓',
            unmute: '🔊',
            warn: '⚠️',
            timeout: '⏰'
        };

        let description = `***${userTag}***\n`;
        description += `${target ? `<@${userId}>` : 'User not in server'}\n`;
        description += `ID: \`\`\`${userId}\`\`\`\n\n`;
        description += `Total Records: ${records.length}\n\n`;

        records.forEach(record => {
            const timestamp = new Date(record.timestamp);
            description += `${emojis[record.command] || '📝'} ${record.command.charAt(0).toUpperCase() + record.command.slice(1)}\n`;
            description += `Case ID: ${record.case_id}\n`;
            description += `Moderator: <@${record.moderator_name}>\n`;
            description += `When: <t:${Math.floor(record.timestamp / 1000)}:R>\n`;
            description += `Reason:\n${record.reason}\n\n`;
        });

        await sendMessage(message, {
            title: 'Member Records',
            description: description,
            color: 0xFF6B6B,
            timestamp: true,
            thumbnail: userAvatar
        });
    }
};

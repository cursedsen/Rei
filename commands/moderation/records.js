import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default {
    name: 'records',
    description: 'View moderation records for a user',
    usage: '<user>',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'You do not have permission to use this command.',
                color: 0xFF0000
            });
        }

        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a user mention or ID to look up.',
                color: 0xFF0000
            });
        }

        const target = message.mentions.members.first() || 
            await message.guild.members.fetch(args[0]).catch(() => null);

        if (!target) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Could not find that user.',
                color: 0xFF0000
            });
        }

        const db = await open({
            filename: 'auditLogs.db',
            driver: sqlite3.Database
        });

        const records = await db.all(
            `SELECT * FROM audit_logs 
             WHERE target_user_id = ? 
             AND guild_id = ?
             ORDER BY timestamp DESC`,
            [target.id, message.guild.id]
        );

        if (records.length === 0) {
            return await sendMessage(message, {
                title: 'Member Records',
                description: `**${target.user.tag}**\n has no violations on record.`,
                color: 0x00FF00,
                thumbnail: target.user.displayAvatarURL()
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

        let description = `***${target.user.tag}***\n`;
        description += `Mention: <@${target.id}>\n`;
        description += `ID: ${target.id}\n\n`;
        description += `Total Records: ${records.length}\n\n`;

        records.forEach(record => {
            const timestamp = new Date(record.timestamp);
            description += `${emojis[record.command] || '📝'} ${record.command.charAt(0).toUpperCase() + record.command.slice(1)}\n`;
            description += `Case ID: ${record.id}\n`;
            description += `Moderator: <@${record.moderator_id}>\n`;
            description += `When: <t:${Math.floor(timestamp.getTime() / 1000)}:R>\n`;
            description += `Reason:\n${record.reason}\n\n`;
        });

        await sendMessage(message, {
            title: 'Member Records',
            description: description,
            color: 0xFFD700,
            timestamp: true,
            thumbnail: target.user.displayAvatarURL()
        });
    }
};

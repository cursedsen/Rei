import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default {
    name: 'audit',
    description: 'View moderation actions taken by a staff member',
    usage: '[user]',
    async execute(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'You do not have permission to use this command.',
                color: 0xFF0000
            });
        }

        let targetModerator;
        if (args[0]) {
            targetModerator = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);
            
            if (!targetModerator) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'Could not find that user.',
                    color: 0xFF0000
                });
            }
        } else {
            targetModerator = message.member;
        }

        const db = await open({
            filename: 'auditLogs.db',
            driver: sqlite3.Database
        });

        const records = await db.all(
            `SELECT * FROM audit_logs 
             WHERE moderator_id = ? 
             AND guild_id = ?
             ORDER BY timestamp DESC`,
            [targetModerator.id, message.guild.id]
        );

        if (records.length === 0) {
            return await sendMessage(message, {
                title: 'Moderator Audit',
                description: `**${targetModerator.user.tag}** has not taken any moderation actions.`,
                color: 0x00FF00,
                thumbnail: targetModerator.user.displayAvatarURL()
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

        let description = `***${targetModerator.user.tag}***\n`;
        description += `Mention: <@${targetModerator.id}>\n`;
        description += `ID: ${targetModerator.id}\n\n`;
        description += `Total Actions: ${records.length}\n\n`;

        records.forEach(record => {
            const timestamp = new Date(record.timestamp);
            description += `${emojis[record.command] || '📝'} ${record.command.charAt(0).toUpperCase() + record.command.slice(1)}\n`;
            description += `Case ID: ${record.id}\n`;
            description += `Target: <@${record.target_user_id}>\n`;
            description += `When: <t:${Math.floor(timestamp.getTime() / 1000)}:R>\n`;
            description += `Reason:\n${record.reason}\n\n`;
        });

        await sendMessage(message, {
            title: 'Moderator Audit',
            description: description,
            color: 0xFFD700,
            timestamp: true,
            thumbnail: targetModerator.user.displayAvatarURL()
        });
    }
};

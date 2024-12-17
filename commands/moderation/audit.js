//works now :3 
import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default {
    name: 'audit',
    description: 'View moderation actions taken by a staff member',
    category: 'moderation',
    usage: '[user] [page]',
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

        const ITEMS_PER_PAGE = 5;
        const page = args[1] ? parseInt(args[1]) : 1;

        const db = await open({
            filename: './serverData/auditLogs.db',
            driver: sqlite3.Database
        }).catch(error => {
            console.error('Database connection error:', error);
            return null;
        });

        if (!db) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Failed to connect to the database.',
                color: 0xFF0000
            });
        }

        try {
            console.log('Query parameters:', {
                moderatorId: targetModerator.id,
                guildId: message.guild.id,
                page: page,
                offset: (page - 1) * ITEMS_PER_PAGE
            });

            const totalRecords = await db.get(
                `SELECT COUNT(*) as count FROM audit_logs 
                 WHERE moderator_name = ? AND guild_id = ?`,
                [targetModerator.id, message.guild.id]
            );

            console.log('Total records found:', totalRecords);

            const records = await db.all(
                `SELECT * FROM audit_logs 
                 WHERE moderator_name = ? 
                 AND guild_id = ?
                 ORDER BY timestamp DESC
                 LIMIT ? OFFSET ?`,
                [targetModerator.id, message.guild.id, ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE]
            );

            console.log('Retrieved records:', records);

            if (records.length === 0) {
                return await sendMessage(message, {
                    title: 'Moderator Audit',
                    description: `**${targetModerator.user.tag}** has not taken any moderation actions.`,
                    color: 0x2B2D31,
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
            description += `Total Actions: ${totalRecords.count}\n`;
            description += `Page ${page} of ${Math.ceil(totalRecords.count / ITEMS_PER_PAGE)}\n\n`;

            records.forEach(record => {
                const emoji = emojis[record.command] || '📝';
                description += `${emoji} ${record.command.charAt(0).toUpperCase() + record.command.slice(1)}\n`;
                description += `Case ID: ${record.case_id}\n`;
                if (record.target_user_name) {
                    description += `Target: <@${record.target_user_name}>\n`;
                }
                description += `When: <t:${Math.floor(record.timestamp / 1000)}:R>\n`;
                description += `Reason:\n${record.reason || 'No reason provided'}\n\n`;
            });

            await sendMessage(message, {
                title: 'Moderator Audit',
                description: description,
                color: 0xFFD700,
                timestamp: true,
                thumbnail: targetModerator.user.displayAvatarURL(),
            });
        } catch (error) {
            console.error('Database query error:', error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while fetching the audit logs.',
                color: 0xFF0000
            });
        } finally {
            await db.close();
        }
    }
};

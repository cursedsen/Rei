import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default {
    name: 'editrecord',
    description: 'Edit the reason of a moderation record',
    category: 'moderation',
    permissions: ['ModerateMembers'],
    usage: '<case_id> <new_reason>',
    execute: async (message, args) => {
        if (!args[0]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a Case ID to edit.',
                color: 0xFF0000,
            });
        }

        if (!args[1]) {
            return await sendMessage(message, {
                title: 'Error',
                description: 'Please provide a new reason for the record.',
                color: 0xFF0000,
            });
        }

        const caseId = args[0].toUpperCase();
        const newReason = args.slice(1).join(' ');

        const db = await open({
            filename: './serverData/auditLogs.db',
            driver: sqlite3.Database
        });

        try {
            const record = await db.get(
                'SELECT * FROM audit_logs WHERE case_id = ? AND guild_id = ?',
                [caseId, message.guild.id]
            );

            if (!record) {
                return await sendMessage(message, {
                    title: 'Error',
                    description: 'Could not find a record with that Case ID in this server.',
                    color: 0xFF0000,
                });
            }

            await db.run(
                'UPDATE audit_logs SET reason = ? WHERE case_id = ?',
                [newReason, caseId]
            );

            const targetUser = await message.client.users.fetch(record.target_user_name).catch(() => null);
            const targetTag = targetUser ? targetUser.tag : 'Unknown User';

            await sendMessage(message, {
                title: 'Record Updated',
                description: `Updated record ${caseId} for ${targetTag}\n` +
                    `**New Reason:** ${newReason}`,
                color: 0x00FF00,
                timestamp: true
            });

        } catch (error) {
            console.error(error);
            await sendMessage(message, {
                title: 'Error',
                description: 'An error occurred while trying to update the record.',
                color: 0xFF0000,
            });
        } finally {
            await db.close();
        }
    }
}; 
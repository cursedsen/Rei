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
        content: 'Please provide a case ID to edit.'
      });
    }

    if (!args[1]) {
      return await sendMessage(message, {
        content: 'Please provide a new reason for the record.'
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
          content: 'Could not find a record with that Case ID in this server.'
        });
      }

      await db.run(
        'UPDATE audit_logs SET reason = ? WHERE case_id = ?',
        [newReason, caseId]
      );

      const targetUser = await message.client.users.fetch(record.target_user_name).catch(() => null);
      const targetTag = targetUser ? targetUser.tag : 'Unknown User';

      await sendMessage(message, {
        content: `Ok, updated record ${caseId} for ${targetTag}\n**New Reason:** ${newReason}`
      });

    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        content: 'An error occurred while trying to update the record.'
      });
    } finally {
      await db.close();
    }
  }
}; 
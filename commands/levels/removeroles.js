import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';

let db;

async function initializeDatabase() {
  db = await open({
    filename: join('./serverData', 'levelroles.db'),
    driver: sqlite3.Database
  });
}

export default {
  name: 'removeroles',
  description: 'Remove all level roles from the server',
  category: 'levels',
  permissions: ['ManageRoles'],
  async execute(message, args) {
    if (!db) await initializeDatabase();

    const progress = await sendMessage(message, {
      description: 'Fetching level roles...',
      color: 0x2b2d31
    });

    try {
      const roles = await db.all(
        'SELECT role_id, role_name FROM level_roles WHERE guild_id = ?',
        [message.guild.id]
      );

      if (!roles.length) {
        return await sendMessage(message, {
          description: 'No level roles found in the database.',
          color: 0xff0000
        });
      }

      let removed = 0;
      let errors = 0;

      for (const role of roles) {
        try {
          const guildRole = await message.guild.roles.fetch(role.role_id);
          if (guildRole) {
            await guildRole.delete('Level role removal');
            removed++;

            if (removed % 5 === 0) {
              await progress.edit({
                embeds: [{
                  description: `Removing level roles... (${removed}/${roles.length})`,
                  color: 0x2b2d31
                }]
              });
            }
          }
        } catch (error) {
          console.error(`Error removing role ${role.role_name}:`, error);
          errors++;
        }
      }

      await db.run(
        'DELETE FROM level_roles WHERE guild_id = ?',
        [message.guild.id]
      );

      await sendMessage(message, {
        title: '✅ Level roles removed',
        description: [
          `Successfully removed ${removed} level roles!`,
          errors > 0 ? `\n⚠️ ${errors} roles failed to remove.` : '',
          '\nDatabase entries have been cleared.'
        ].join('\n'),
        color: 0x57f287
      });

    } catch (error) {
      console.error('Error in removeroles command:', error);
      await sendMessage(message, {
        title: 'Error',
        description: 'An error occurred while removing level roles.',
        color: 0xff0000
      });
    }
  }
};
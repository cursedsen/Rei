import { sendMessage } from '../../functions/reiMessageMaker.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'path';

// MAJOR WIP
// IGNORE
let db;
async function initializeDatabase() {
  db = await open({
    filename: join('./serverData', 'userdata.db'),
    driver: sqlite3.Database
  });
}

export default {
  name: 'rewards',
  description: 'Manage level rewards',
  category: 'levels',
  permissions: ['ManageRoles'],
  usage: '<add/remove/list> [level] [@role]',
  aliases: ['rewards'],
  async execute(message, args) {
    if (!db) await initializeDatabase();

    const subcommand = args[0]?.toLowerCase();

    switch (subcommand) {
      case 'add': {
        const level = parseInt(args[1]);
        const role = message.mentions.roles.first();

        if (!level || !role) {
          return await sendMessage(message, {
            description: 'Please provide a level and role!',
            color: 0xff0000
          });
        }

        await db.run(
          'INSERT OR REPLACE INTO level_rewards (guild_id, level, role_id) VALUES (?, ?, ?)',
          [message.guild.id, level, role.id]
        );

        await sendMessage(message, {
          description: `Added ${role} as a reward for level ${level}!`,
          color: 0x57f287
        });
        break;
      }

      case 'remove': {
        const level = parseInt(args[1]);

        if (!level) {
          return await sendMessage(message, {
            description: 'Please provide a level!',
            color: 0xff0000
          });
        }

        await db.run(
          'DELETE FROM level_rewards WHERE guild_id = ? AND level = ?',
          [message.guild.id, level]
        );

        await sendMessage(message, {
          description: `Removed reward for level ${level}!`,
          color: 0x57f287
        });
        break;
      }

      case 'list': {
        const rewards = await db.all(
          'SELECT level, role_id FROM level_rewards WHERE guild_id = ? ORDER BY level ASC',
          [message.guild.id]
        );

        if (!rewards.length) {
          return await sendMessage(message, {
            description: 'No role rewards set up yet!',
            color: 0xff0000
          });
        }

        const description = rewards.map(reward =>
          `Level ${reward.level} ➥ <@&${reward.role_id}>`
        ).join('\n');

        await sendMessage(message, {
          title: '🎁 Level Rewards',
          description: description,
          color: 0x2b2d31
        });
        break;
      }

      default:
        await sendMessage(message, {
          description: 'Invalid subcommand! Use add, remove, or list.',
          color: 0xff0000
        });
    }
  }
}; 
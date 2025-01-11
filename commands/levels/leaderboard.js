import { sendMessage } from '../../functions/reiMessageMaker.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'path';

let db;
async function initializeDatabase() {
  db = await open({
    filename: join('./serverData', 'userdata.db'),
    driver: sqlite3.Database
  });
}

export default {
  name: 'leaderboard',
  description: 'View the server\'s XP and message leaderboard',
  category: 'levels',
  aliases: ['lb', 'top', 'msgs'],
  async execute(message, args) {
    if (!db) await initializeDatabase();

    const page = parseInt(args[0]) || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const leaderboard = await db.all(`
            SELECT 
                ul.user_id,
                ul.xp,
                ul.level,
                COALESCE(ms.message_count, 0) as message_count
            FROM user_levels ul
            LEFT JOIN message_stats ms 
                ON ul.user_id = ms.user_id 
                AND ul.guild_id = ms.guild_id
            WHERE ul.guild_id = ?
            ORDER BY ul.xp DESC
            LIMIT ? OFFSET ?
        `, [message.guild.id, perPage, offset]);

    if (!leaderboard.length) {
      return await sendMessage(message, {
        description: 'No one has earned XP yet!',
        color: 0xff0000
      });
    }

    const description = await Promise.all(leaderboard.map(async (entry, index) => {
      try {
        const user = await message.client.users.fetch(entry.user_id);
        const position = offset + index + 1;
        const medal = position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : `${position}.`;
        return [
          `${medal} ${user.tag}`,
          `➥ Level ${entry.level} (${entry.xp.toLocaleString()} XP)`,
          `➥ ${entry.message_count.toLocaleString()} messages`
        ].join('\n');
      } catch (error) {
        const position = offset + index + 1;
        const medal = position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : `${position}.`;
        return [
          `${medal} Unknown User`,
          `➥ Level ${entry.level} (${entry.xp.toLocaleString()} XP)`,
          `➥ ${entry.message_count.toLocaleString()} messages`
        ].join('\n');
      }
    }));

    await sendMessage(message, {
      title: '🏆 Server Leaderboard',
      description: description.join('\n\n'),
      color: 0x2b2d31,
      footer: { text: `Page ${page}` }
    });
  }
}; 
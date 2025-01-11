import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getRank } from '../../functions/levelSystem.js';
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
  name: 'messages',
  description: 'Check message count statistics',
  category: 'levels',
  aliases: ['activity'],
  async execute(message, args) {
    if (!db) await initializeDatabase();

    const target = message.mentions.users.first() || message.author;

    const stats = await db.get(
      'SELECT message_count FROM message_stats WHERE user_id = ? AND guild_id = ?',
      [target.id, message.guild.id]
    );

    const rank = await getRank(target.id, message.guild.id);

    if (!stats) {
      return await sendMessage(message, {
        description: 'No message statistics found for this user.',
        color: 0xff0000
      });
    }

    const messageRank = await db.get(`
            SELECT COUNT(*) as rank 
            FROM message_stats 
            WHERE guild_id = ? AND message_count > ?
        `, [message.guild.id, stats.message_count]);

    await sendMessage(message, {
      title: `📊 ${target.username}'s Activity`,
      description: [
        `**Messages Sent:** ${stats.message_count.toLocaleString()}`,
        `**Message Rank:** #${messageRank.rank + 1}`,
        `**Level:** ${rank ? rank.level : 0}`,
        `**XP:** ${rank ? rank.xp : 0}`,
        '',
        '*Messages can be off by a few.*'
      ].join('\n'),
      color: 0x2b2d31,
      thumbnail: target.displayAvatarURL({ dynamic: true })
    });
  }
}; 
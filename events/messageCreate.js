import { addXP } from '../functions/levelSystem.js';
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
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        if (!db) await initializeDatabase();

        await db.run(`
            INSERT INTO message_stats (user_id, guild_id, message_count, last_counted_timestamp)
            VALUES (?, ?, 1, ?)
            ON CONFLICT(user_id, guild_id) DO UPDATE SET
            message_count = message_count + 1,
            last_counted_timestamp = excluded.last_counted_timestamp
        `, [message.author.id, message.guild.id, Date.now()]);

        const messageLength = message.content.length;
        let bonusXP = 0;

        if (messageLength > 50) bonusXP = 5;
        if (messageLength > 100) bonusXP = 10;
        if (messageLength > 200) bonusXP = 15;

        await addXP(message.author.id, message.guild.id, 15 + bonusXP);
    }
}; 
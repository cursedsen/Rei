import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { sendMessage } from './reiMessageMaker.js';

let db;

async function initializeDatabase() {
    db = await open({
        filename: './serverData/serverConfig.db',
        driver: sqlite3.Database
    });
}

export async function createReactionRole(guildId, channelId, messageId, emoji, roleId) {
    if (!db) await initializeDatabase();
    
    await db.run(
        'INSERT INTO reaction_roles (guild_id, channel_id, message_id, emoji, role_id) VALUES (?, ?, ?, ?, ?)',
        [guildId, channelId, messageId, emoji, roleId]
    );
}

export async function removeReactionRole(messageId, emoji) {
    if (!db) await initializeDatabase();
    
    await db.run(
        'DELETE FROM reaction_roles WHERE message_id = ? AND emoji = ?',
        [messageId, emoji]
    );
}

export async function getReactionRoles(messageId) {
    if (!db) await initializeDatabase();
    
    return await db.all(
        'SELECT * FROM reaction_roles WHERE message_id = ?',
        [messageId]
    );
}

export async function createReactionMessage(messageId, guildId, channelId, description) {
    if (!db) await initializeDatabase();
    
    await db.run(
        'INSERT INTO reaction_messages (message_id, guild_id, channel_id, description) VALUES (?, ?, ?, ?)',
        [messageId, guildId, channelId, description]
    );
} 
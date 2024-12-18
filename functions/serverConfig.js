import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { mkdir } from 'fs/promises';
import { join } from 'path';

let db;

async function initializeDatabase() {
    const serverDataPath = './serverData';
    try {
        await mkdir(serverDataPath, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }

    db = await open({
        filename: join(serverDataPath, 'serverConfig.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS server_config (
            guild_id TEXT PRIMARY KEY,
            log_channel_join_leave TEXT,
            log_channel_mod_audit TEXT,
            log_channel_edits TEXT,
            log_channel_deletions TEXT,
            mute_role TEXT,
            prefix TEXT DEFAULT '.'
        )
    `);
}

async function getServerConfig(guildId) {
    if (!db) await initializeDatabase();
    
    let config = await db.get('SELECT * FROM server_config WHERE guild_id = ?', guildId);
    
    if (!config) {
        await db.run(
            'INSERT INTO server_config (guild_id) VALUES (?)',
            guildId
        );
        config = await db.get('SELECT * FROM server_config WHERE guild_id = ?', guildId);
    }
    
    return config;
}

async function updateServerConfig(guildId, setting, value) {
    if (!db) await initializeDatabase();
    
    const validSettings = [
        'log_channel_join_leave',
        'log_channel_mod_audit',
        'log_channel_edits',
        'log_channel_deletions',
        'mute_role',
        'prefix'
    ];

    if (!validSettings.includes(setting)) {
        throw new Error('Invalid setting');
    }

    await db.run(
        `UPDATE server_config SET ${setting} = ? WHERE guild_id = ?`,
        [value, guildId]
    );
}

export const getServerPrefix = async (guildId) => {
    if (!db) await initializeDatabase();
    
    const config = await getServerConfig(guildId);
    return config?.prefix?.toLowerCase() || '-';
}

export { getServerConfig, updateServerConfig }; 
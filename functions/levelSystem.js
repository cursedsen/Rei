import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { sendMessage } from './reiMessageMaker.js';
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
        filename: join(serverDataPath, 'userdata.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_levels (
            user_id TEXT,
            guild_id TEXT,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            last_message_timestamp INTEGER,
            PRIMARY KEY (user_id, guild_id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS level_rewards (
            guild_id TEXT,
            level INTEGER,
            role_id TEXT,
            PRIMARY KEY (guild_id, level)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS message_stats (
            user_id TEXT,
            guild_id TEXT,
            message_count INTEGER DEFAULT 0,
            last_counted_timestamp INTEGER,
            PRIMARY KEY (user_id, guild_id)
        )
    `);
}

initializeDatabase();

const BASE_XP = 15;
const XP_VARIANCE = 10;
const XP_COOLDOWN = 60000;
const LEVEL_SCALING = 1.1;

function calculateLevel(xp) {
    // using a logarithmic formula for level calculation
    // level = log(xp/100)/log(LEVEL_SCALING) + 1
    return Math.floor(Math.log(xp / 100) / Math.log(LEVEL_SCALING) + 1);
}

function xpForLevel(level) {
    // inverse of the level calculation
    // xp= 100 * LEVEL_SCALING^(level-1)
    return Math.floor(100 * Math.pow(LEVEL_SCALING, level - 1));
}

export async function addXP(userId, guildId, bulkXP = null) {
    if (!db) await initializeDatabase();

    let userData = await db.get(
        'SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?',
        [userId, guildId]
    );

    const now = Date.now();

    if (!bulkXP) {
        const lastMessageTime = userData?.last_message_timestamp || 0;
        if (now - lastMessageTime < XP_COOLDOWN) {
            return null;
        }
        bulkXP = BASE_XP + Math.floor(Math.random() * XP_VARIANCE);
    }

    if (!userData) {
        await db.run(
            'INSERT INTO user_levels (user_id, guild_id, xp, level, last_message_timestamp) VALUES (?, ?, ?, 0, ?)',
            [userId, guildId, bulkXP, now]
        );
        userData = { xp: bulkXP, level: 0 };
    } else {
        const newXP = userData.xp + bulkXP;
        const newLevel = calculateLevel(newXP);
        
        await db.run(
            'UPDATE user_levels SET xp = ?, level = ?, last_message_timestamp = ? WHERE user_id = ? AND guild_id = ?',
            [newXP, newLevel, now, userId, guildId]
        );

        if (newLevel > userData.level) {
            return {
                oldLevel: userData.level,
                newLevel: newLevel,
                xp: newXP
            };
        }
    }

    return null;
}

export async function getRank(userId, guildId) {
    if (!db) await initializeDatabase();

    const userData = await db.get(
        'SELECT * FROM user_levels WHERE user_id = ? AND guild_id = ?',
        [userId, guildId]
    );

    if (!userData) return null;

    const rank = await db.get(`
        SELECT COUNT(*) as rank 
        FROM user_levels 
        WHERE guild_id = ? AND xp > ?
    `, [guildId, userData.xp]);

    const currentLevel = calculateLevel(userData.xp);
    const nextLevelXP = xpForLevel(currentLevel + 1);
    const currentLevelXP = xpForLevel(currentLevel);
    const xpNeeded = nextLevelXP - currentLevelXP;
    const xpProgress = userData.xp - currentLevelXP;

    return {
        xp: userData.xp,
        level: currentLevel,
        rank: rank.rank + 1,
        nextLevelXP: nextLevelXP,
        currentLevelXP: currentLevelXP,
        xpNeeded: xpNeeded,
        xpProgress: xpProgress
    };
} 
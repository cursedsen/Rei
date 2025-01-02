import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';

let db;

async function initializeDatabase() {
    db = await open({
        filename: './serverData/economy.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_economy (
            user_id TEXT,
            guild_id TEXT,
            balance INTEGER DEFAULT 0,
            bank_balance INTEGER DEFAULT 0,
            last_daily TIMESTAMP,
            daily_streak INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, guild_id)
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS shop_items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT,
            name TEXT,
            description TEXT,
            price INTEGER,
            role_reward TEXT,
            is_active BOOLEAN DEFAULT 1
        )
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS user_inventory (
            user_id TEXT,
            guild_id TEXT,
            item_id INTEGER,
            quantity INTEGER DEFAULT 1,
            acquired_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, guild_id, item_id)
        )
    `);
}

async function getBalance(userId, guildId) {
    if (!db) await initializeDatabase();
    
    let user = await db.get(
        'SELECT balance, bank_balance FROM user_economy WHERE user_id = ? AND guild_id = ?',
        [userId, guildId]
    );
    
    if (!user) {
        await db.run(
            'INSERT INTO user_economy (user_id, guild_id) VALUES (?, ?)',
            [userId, guildId]
        );
        return { balance: 0, bankBalance: 0 };
    }
    
    return { balance: user.balance, bankBalance: user.bank_balance };
}

async function addMoney(userId, guildId, amount, isBankDeposit = false) {
    if (!db) await initializeDatabase();
    
    const column = isBankDeposit ? 'bank_balance' : 'balance';
    await db.run(
        `INSERT INTO user_economy (user_id, guild_id, ${column})
         VALUES (?, ?, ?)
         ON CONFLICT(user_id, guild_id) DO UPDATE SET
         ${column} = ${column} + ?`,
        [userId, guildId, amount, amount]
    );
}

async function claimDaily(userId, guildId) {
    if (!db) await initializeDatabase();
    
    const user = await db.get(
        'SELECT last_daily, daily_streak FROM user_economy WHERE user_id = ? AND guild_id = ?',
        [userId, guildId]
    );
    
    const now = new Date();
    const lastDaily = user?.last_daily ? new Date(user.last_daily) : null;
    
    if (lastDaily && now - lastDaily < 24 * 60 * 60 * 1000) {
        return { success: false, timeLeft: 24 * 60 * 60 * 1000 - (now - lastDaily) };
    }
    
    let streak = user?.daily_streak || 0;
    if (lastDaily && now - lastDaily < 48 * 60 * 60 * 1000) {
        streak++;
    } else {
        streak = 1;
    }
    
    const baseReward = 100;
    const streakBonus = Math.min(streak * 10, 100);
    const totalReward = baseReward + streakBonus;
    
    await db.run(
        `INSERT INTO user_economy (user_id, guild_id, balance, last_daily, daily_streak)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, guild_id) DO UPDATE SET
         balance = balance + ?,
         last_daily = ?,
         daily_streak = ?`,
        [userId, guildId, totalReward, now.toISOString(), streak,
         totalReward, now.toISOString(), streak]
    );
    
    return {
        success: true,
        reward: totalReward,
        streak: streak,
        streakBonus: streakBonus
    };
}

export {
    getBalance,
    addMoney,
    claimDaily
}; 
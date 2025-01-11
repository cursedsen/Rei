import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

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
        CREATE TABLE IF NOT EXISTS game_stats (
            user_id TEXT,
            game_type TEXT,
            games_played INTEGER DEFAULT 0,
            games_won INTEGER DEFAULT 0,
            total_bets INTEGER DEFAULT 0,
            total_winnings INTEGER DEFAULT 0,
            total_losses INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, game_type)
        )
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS active_bets (
            game_id TEXT,
            user_id TEXT,
            guild_id TEXT,
            bet_amount INTEGER,
            bet_on_user TEXT,
            placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (game_id, user_id, guild_id)
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
            is_active BOOLEAN DEFAULT 1,
            item_type TEXT DEFAULT 'general'
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

  await db.exec(`
        CREATE TABLE IF NOT EXISTS active_games (
            game_id TEXT PRIMARY KEY,
            guild_id TEXT,
            channel_id TEXT,
            game_type TEXT,
            current_player TEXT,
            players TEXT,
            game_state TEXT,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

  const defaultItems = [
    {
      name: 'Magnifying Glass',
      description: 'Peek at the next shell in the chamber',
      price: 150,
      item_type: 'buckshot'
    },
    {
      name: 'Handcuffs',
      description: 'Force the opponent to shoot twice',
      price: 200,
      item_type: 'buckshot'
    },
    {
      name: 'Beer',
      description: 'Heal 1 HP',
      price: 100,
      item_type: 'buckshot'
    },
    {
      name: 'Cigarette',
      description: 'Skip your turn',
      price: 75,
      item_type: 'buckshot'
    },
    {
      name: 'Mirror',
      description: 'Reflect the shot back to your opponent',
      price: 300,
      item_type: 'buckshot'
    },
    {
      name: 'Saw',
      description: 'Remove one live shell from the chamber',
      price: 250,
      item_type: 'buckshot'
    },
    {
      name: 'Blindfold',
      description: 'Force next player to shoot randomly',
      price: 200,
      item_type: 'buckshot'
    },
    {
      name: 'Defibrillator',
      description: 'Revive with 1 HP when you die (one-time use)',
      price: 500,
      item_type: 'buckshot'
    },
    {
      name: 'Adrenaline',
      description: 'Take another turn after this one',
      price: 350,
      item_type: 'buckshot'
    },
    {
      name: 'Bulletproof Vest',
      description: 'Survive one lethal shot',
      price: 400,
      item_type: 'buckshot'
    }
  ];

  for (const item of defaultItems) {
    await db.run(`
            INSERT OR IGNORE INTO shop_items (name, description, price, item_type)
            VALUES (?, ?, ?, ?)
        `, [item.name, item.description, item.price, item.item_type]);
  }
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

async function getShopItems(guildId, itemType = null) {
  if (!db) await initializeDatabase();

  const query = itemType
    ? 'SELECT * FROM shop_items WHERE (guild_id IS NULL OR guild_id = ?) AND item_type = ? AND is_active = 1'
    : 'SELECT * FROM shop_items WHERE (guild_id IS NULL OR guild_id = ?) AND is_active = 1';

  const params = itemType ? [guildId, itemType] : [guildId];
  return await db.all(query, params);
}

async function buyItem(userId, guildId, itemId) {
  if (!db) await initializeDatabase();

  const item = await db.get('SELECT * FROM shop_items WHERE item_id = ?', itemId);
  if (!item) return { success: false, reason: 'Item not found' };

  const { balance } = await getBalance(userId, guildId);
  if (balance < item.price) return { success: false, reason: 'Insufficient funds' };

  await db.run('BEGIN TRANSACTION');
  try {
    await addMoney(userId, guildId, -item.price);

    await db.run(`
            INSERT INTO user_inventory (user_id, guild_id, item_id, quantity)
            VALUES (?, ?, ?, 1)
            ON CONFLICT(user_id, guild_id, item_id) DO UPDATE SET
            quantity = quantity + 1
        `, [userId, guildId, itemId]);

    await db.run('COMMIT');
    return { success: true, item };
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

async function getInventory(userId, guildId, itemType = null) {
  if (!db) await initializeDatabase();

  const query = `
        SELECT i.*, s.name, s.description, s.item_type
        FROM user_inventory i
        JOIN shop_items s ON i.item_id = s.item_id
        WHERE i.user_id = ? AND i.guild_id = ?
        ${itemType ? 'AND s.item_type = ?' : ''}
    `;

  const params = itemType ? [userId, guildId, itemType] : [userId, guildId];
  return await db.all(query, params);
}

async function useItem(userId, guildId, itemId) {
  if (!db) await initializeDatabase();

  const inventory = await db.get(
    'SELECT * FROM user_inventory WHERE user_id = ? AND guild_id = ? AND item_id = ? AND quantity > 0',
    [userId, guildId, itemId]
  );

  if (!inventory) return { success: false, reason: 'Item not found in inventory' };

  await db.run(`
        UPDATE user_inventory
        SET quantity = quantity - 1
        WHERE user_id = ? AND guild_id = ? AND item_id = ?
    `, [userId, guildId, itemId]);

  await db.run(`
        DELETE FROM user_inventory
        WHERE user_id = ? AND guild_id = ? AND item_id = ? AND quantity <= 0
    `, [userId, guildId, itemId]);

  return { success: true };
}

async function placeBet(gameId, userId, guildId, amount, betOnUserId) {
  if (!db) await initializeDatabase();

  const { balance } = await getBalance(userId, guildId);
  if (balance < amount) return { success: false, reason: 'Insufficient funds' };

  await db.run('BEGIN TRANSACTION');
  try {
    await addMoney(userId, guildId, -amount);

    await db.run(`
            INSERT INTO active_bets (game_id, user_id, guild_id, bet_amount, bet_on_user)
            VALUES (?, ?, ?, ?, ?)
        `, [gameId, userId, guildId, amount, betOnUserId]);

    await db.run('COMMIT');
    return { success: true };
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
}

async function resolveBets(gameId, winnerId) {
  if (!db) await initializeDatabase();

  const bets = await db.all('SELECT * FROM active_bets WHERE game_id = ?', gameId);

  for (const bet of bets) {
    const won = bet.bet_on_user === winnerId;
    const winnings = won ? bet.bet_amount * 2 : 0;

    await db.run(`
            INSERT INTO game_stats (user_id, game_type, total_bets, total_winnings, total_losses)
            VALUES (?, 'buckshot', 1, ?, ?)
            ON CONFLICT(user_id, game_type) DO UPDATE SET
            total_bets = total_bets + 1,
            total_winnings = total_winnings + ?,
            total_losses = total_losses + ?
        `, [
      bet.user_id,
      won ? winnings : 0, won ? 0 : bet.bet_amount,
      won ? winnings : 0, won ? 0 : bet.bet_amount
    ]);

    if (won) {
      await addMoney(bet.user_id, bet.guild_id, winnings);
    }
  }

  await db.run('DELETE FROM active_bets WHERE game_id = ?', gameId);
}

async function updateGameStats(userId, guildId, won) {
  if (!db) await initializeDatabase();

  await db.run(`
        INSERT INTO game_stats (user_id, game_type, games_played, games_won)
        VALUES (?, 'buckshot', 1, ?)
        ON CONFLICT(user_id, game_type) DO UPDATE SET
        games_played = games_played + 1,
        games_won = games_won + ?
    `, [userId, won ? 1 : 0, won ? 1 : 0]);
}

async function getGameStats(userId, guildId) {
  if (!db) await initializeDatabase();

  return await db.get(
    'SELECT * FROM game_stats WHERE user_id = ? AND game_type = ?',
    [userId, 'buckshot']
  ) || {
    games_played: 0,
    games_won: 0,
    total_bets: 0,
    total_winnings: 0,
    total_losses: 0
  };
}

async function getActiveBets(gameId) {
  if (!db) await initializeDatabase();
  return await db.all('SELECT * FROM active_bets WHERE game_id = ?', gameId);
}

export {
  getBalance,
  addMoney,
  claimDaily,
  getShopItems,
  buyItem,
  getInventory,
  useItem,
  placeBet,
  resolveBets,
  updateGameStats,
  getGameStats,
  getActiveBets
}; 
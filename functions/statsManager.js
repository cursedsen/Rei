import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

async function initializeDatabase() {
  db = await open({
    filename: './serverData/playerstats.db',
    driver: sqlite3.Database
  });

  // Buckshot Roulette Stats
  await db.exec(`
        CREATE TABLE IF NOT EXISTS buckshot_stats (
            user_id TEXT PRIMARY KEY,
            games_played INTEGER DEFAULT 0,
            games_won INTEGER DEFAULT 0,
            total_bets INTEGER DEFAULT 0,
            total_winnings INTEGER DEFAULT 0,
            total_losses INTEGER DEFAULT 0
        )
    `);

  // Future games can be added here like:
  // await db.exec(`
  //     CREATE TABLE IF NOT EXISTS slots_stats (
  //         user_id TEXT PRIMARY KEY,
  //         games_played INTEGER DEFAULT 0,
  //         total_winnings INTEGER DEFAULT 0,
  //         total_losses INTEGER DEFAULT 0,
  //         jackpots_won INTEGER DEFAULT 0
  //     )
  // `);
}

async function updateGameStats(userId, gameType, won) {
  if (!db) await initializeDatabase();

  switch (gameType) {
    case 'buckshot':
      await db.run(`
                INSERT INTO buckshot_stats (user_id, games_played, games_won)
                VALUES (?, 1, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                games_played = games_played + 1,
                games_won = games_won + ?
            `, [userId, won ? 1 : 0, won ? 1 : 0]);
      break;

    // Add more cases for future games
    // case 'slots':
    //     // Update slots stats
    //     break;
  }
}

async function updateBettingStats(userId, gameType, betAmount, won) {
  if (!db) await initializeDatabase();

  const winnings = won ? betAmount * 2 : 0;
  const losses = won ? 0 : betAmount;

  switch (gameType) {
    case 'buckshot':
      await db.run(`
                INSERT INTO buckshot_stats (user_id, total_bets, total_winnings, total_losses)
                VALUES (?, 1, ?, ?)
                ON CONFLICT(user_id) DO UPDATE SET
                total_bets = total_bets + 1,
                total_winnings = total_winnings + ?,
                total_losses = total_losses + ?
            `, [userId, winnings, losses, winnings, losses]);
      break;

    // Add more cases for future games
    // case 'slots':
    //     // Update slots betting stats
    //     break;
  }
}

async function getPlayerStats(userId, gameType) {
  if (!db) await initializeDatabase();

  switch (gameType) {
    case 'buckshot':
      return await db.get(
        'SELECT * FROM buckshot_stats WHERE user_id = ?',
        [userId]
      ) || {
        games_played: 0,
        games_won: 0,
        total_bets: 0,
        total_winnings: 0,
        total_losses: 0
      };

    // Add more cases for future games
    // case 'slots':
    //     return await db.get('SELECT * FROM slots_stats WHERE user_id = ?', [userId]);

    default:
      return null;
  }
}

export {
  updateGameStats,
  updateBettingStats,
  getPlayerStats
}; 
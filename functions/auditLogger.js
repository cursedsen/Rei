import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { sendMessage } from './reiMessageMaker.js';

let db;

async function initializeDatabase() {
  db = await open({
    filename: 'auditLogs.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      moderator_id TEXT,
      moderator_name TEXT,
      command TEXT,
      target_user_id TEXT,
      target_user_name TEXT,
      reason TEXT,
      guild_id TEXT
    )
  `);
}

async function logModAction(message, command, targetUser, reason) {
  try {
    if (!db) await initializeDatabase();

    await db.run(`
      INSERT INTO audit_logs (
        moderator_id, 
        moderator_name, 
        command, 
        target_user_id, 
        target_user_name, 
        reason, 
        guild_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      message.author.id,
      message.author.tag,
      command,
      targetUser?.id || null,
      targetUser?.tag || null,
      reason || 'No reason provided',
      message.guild.id
    ]);

    const auditLogChannel = message.guild.channels.cache.find(
      channel => channel.name === 'mod-audit'
    );

    if (auditLogChannel) {
      const emojis = {
        ban: '🔨',
        kick: '👢',
        mute: '🔇',
        unban: '🔓',
        unmute: '🔊',
        warn: '⚠️',
        timeout: '⏰'
      };

      const emoji = emojis[command] || '🛡️';

      await sendMessage(auditLogChannel, {
        title: `${emoji} Member ${
          command === 'mute' ? 'Muted' :
          command === 'unmute' ? 'Unmuted' :
          command === 'ban' ? 'Banned' :
          command === 'unban' ? 'Unbanned' :
          command === 'timeout' ? 'Timed out' :
          command === 'warn' ? 'Warned' :
          command === 'kick' ? 'Kicked' :
          command.charAt(0).toUpperCase() + command.slice(1)
        }`,
        description: `**Reason**\n${reason || 'No reason provided'}\n\n` +
          `**Member**\n${targetUser ? `<@${targetUser.tag}> | ${targetUser.username}\n\`${targetUser.id}\`` : 'N/A'}\n\n` +
          `**Moderator Responsible**\n<@${message.author.tag}> | ${message.author.username}\n\`${message.author.id}\`\n\n` +
          `**Command Location**\n${message.channel} | [Jump to Message](${message.url})`,
        color: 0x2f3136,
        thumbnail: targetUser?.displayAvatarURL() || null,
        footer: {
          text: new Date().toLocaleString()
        }
      });
    }
  } catch (error) {
    console.error('Error logging mod action:', error);
  }
}

export { logModAction }; 
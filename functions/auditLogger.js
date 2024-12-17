import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { sendMessage } from './reiMessageMaker.js';
import { getServerConfig } from './serverConfig.js';

let db;

async function initializeDatabase() {
    db = await open({
        filename: './serverData/auditLogs.db',
        driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_id TEXT,
      timestamp INTEGER DEFAULT (unixepoch()),
      unix_timestamp INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      moderator_name TEXT,
      command TEXT,
      target_user_name TEXT,
      reason TEXT,
      guild_id TEXT
    )
  `);
}

async function logModAction(message, command, targetUser, reason) {
  const ignoredCommands = ['audit', 'test', 'unkick', 'records'];
  
  if (ignoredCommands.includes(command)) return;

  try {
    if (!db) await initializeDatabase();

    const caseId = Math.floor(Date.now() / 1000).toString(36).toUpperCase();
    const unixTimestamp = Date.now();

    await db.run(`
      INSERT INTO audit_logs (
        case_id,
        timestamp,
        moderator_name,
        command,
        target_user_name,
        reason,
        guild_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      caseId,
      unixTimestamp,
      `${message.author.id}`,
      command,
      targetUser ? `${targetUser.id}` : null,
      reason || 'No reason provided',
      message.guild.id
    ]);

    const serverConfig = await getServerConfig(message.guild.id);
    const auditLogChannel = message.guild.channels.cache.get(serverConfig.log_channel_mod_audit);

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
          `**Member**\n${targetUser ? `<@${targetUser.id}> | ${targetUser.tag}\n\`\`\`${targetUser.id}\`\`\`` : 'N/A'}\n` +
          `**Moderator Responsible**\n <@${message.author.id}> | ${message.author.tag}\n\`\`\`${message.author.id}\`\`\`\n` +
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
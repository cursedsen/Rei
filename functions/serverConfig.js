import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { mkdir } from 'fs/promises';
import { join } from 'path';

let db;

async function initializeDatabase() {
	if (!db) {
		db = await open({
			filename: './serverData/serverconfig.db',
			driver: sqlite3.Database
		});
	}

	await db.exec(`
		CREATE TABLE IF NOT EXISTS server_config (
			guild_id TEXT PRIMARY KEY,
			log_channel_join_leave TEXT,
			log_channel_mod_audit TEXT,
			log_channel_edits TEXT,
			log_channel_deletions TEXT,
			log_channel_profiles TEXT,
			mute_role TEXT,
			prefix TEXT,
			starboard_channel TEXT,
			starboard_threshold INTEGER DEFAULT 5
		)
	`);

	const tableInfo = await db.all("PRAGMA table_info(server_config)");
	const columns = tableInfo.map(col => col.name);

	if (!columns.includes('starboard_channel')) {
		await db.exec('ALTER TABLE server_config ADD COLUMN starboard_channel TEXT');
	}

	if (!columns.includes('starboard_threshold')) {
		await db.exec('ALTER TABLE server_config ADD COLUMN starboard_threshold INTEGER DEFAULT 5');
	}

	if (!columns.includes('log_channel_profiles')) {
		await db.exec('ALTER TABLE server_config ADD COLUMN log_channel_profiles TEXT');
	}
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

	config.defaultPrefixes = ['!', '?', '-'];

	return config;
}

async function updateServerConfig(guildId, setting, value) {
	if (!db) await initializeDatabase();

	const validSettings = [
		'log_channel_join_leave',
		'log_channel_mod_audit',
		'log_channel_edits',
		'log_channel_deletions',
		'log_channel_profiles',
		'mute_role',
		'prefix',
		'starboard_channel',
		'starboard_threshold'
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
	return config.prefix || '-';
}

export { getServerConfig, updateServerConfig, initializeDatabase };

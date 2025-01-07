import { sendMessage } from '../../functions/reiMessageMaker.js';
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
        filename: join(serverDataPath, 'levelroles.db'),
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS level_roles (
            guild_id TEXT,
            level INTEGER,
            role_id TEXT,
            role_name TEXT,
            PRIMARY KEY (guild_id, level)
        )
    `);
}

const levelColors = {
    200: '#b5345c',
    190: '#8f714d',
    180: '#512335',
    170: '#ba4fc1',
    160: '#704fbf',
    150: '#4b87d2',
    140: '#44753a',
    130: '#f3c322',
    120: '#d05842',
    110: '#b82941',
    100: '#78797b',
    90: '#8f714d',
    80: '#512335',
    70: '#ba4fc1',
    60: '#704fbf',
    50: '#4b87d2',
    40: '#44753a',
    30: '#f3c322',
    20: '#d05842',
    15: '#b82941',
    10: '#b82941',
    5: '#78797b'
};

export default {
    name: 'makeroles',
    description: 'Create level roles for the server',
    category: 'levels',
    permissions: ['ManageRoles'],
    async execute(message, args) {
        if (!db) await initializeDatabase();

        const levelMilestones = Object.keys(levelColors).map(Number).sort((a, b) => a - b);

        const progress = await sendMessage(message, {
            description: 'Creating level roles...',
            color: 0x2b2d31
        });

        let created = 0;
        let errors = 0;

        for (const level of levelMilestones) {
            try {
                const roleName = `Level ${level}`;
                const role = await message.guild.roles.create({
                    name: roleName,
                    color: levelColors[level],
                    reason: 'Level role creation'
                });

                await db.run(
                    'INSERT OR REPLACE INTO level_roles (guild_id, level, role_id, role_name) VALUES (?, ?, ?, ?)',
                    [message.guild.id, level, role.id, roleName]
                );

                created++;

                if (created % 5 === 0) {
                    await progress.edit({
                        embeds: [{
                            description: `Creating level roles... (${created}/${levelMilestones.length})`,
                            color: 0x2b2d31
                        }]
                    });
                }
            } catch (error) {
                console.error(`Error creating role for level ${level}:`, error);
                errors++;
            }
        }

        await sendMessage(message, {
            title: '✅ Level Roles Created',
            description: [
                `Successfully created ${created} level roles!`,
                errors > 0 ? `\n⚠️ ${errors} roles failed to create.` : '',
                '\nUse the rewards command to manage level rewards.',
                `Level milestones: ${levelMilestones.join(', ')}`
            ].join('\n'),
            color: 0x57f287
        });
    }
};

import { sendMessage } from '../../functions/reiMessageMaker.js';
import { addXP, getRank } from '../../functions/levelSystem.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { join } from 'path';

let database;
let levelRolesDb;

async function initializeDatabase() {
    database = await open({
        filename: join('./serverData', 'userdata.db'),
        driver: sqlite3.Database
    });

    levelRolesDb = await open({
        filename: join('./serverData', 'levelroles.db'),
        driver: sqlite3.Database
    });
}

export default {
    name: 'indexmessages',
    description: 'Index existing messages to assign XP',
    category: 'admin',
    permissions: ['Administrator'],
    aliases: ['indexxp', 'syncxp'],
    async execute(message, args) {
        if (!database) await initializeDatabase();
        
        const confirmation = await sendMessage(message, {
            title: '📊 Message indexing',
            description: [
                'This will:',
                '• Scan all accessible channels',
                '• Count messages per user',
                '• Assign XP based on message count and length',
                '• Update level roles accordingly',
                '',
                '⚠️ This may take a while depending on server size',
                '',
                'Continue? (yes/no)'
            ].join('\n'),
            color: 0x2b2d31
        });

        try {
            const filter = m => m.author.id === message.author.id;
            const response = await message.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time']
            });

            if (!response.first().content.toLowerCase().includes('yes')) {
                return await sendMessage(message, {
                    description: 'Indexing cancelled.',
                    color: 0xff0000
                });
            }
        } catch (error) {
            return await sendMessage(message, {
                description: 'Indexing cancelled (timeout).',
                color: 0xff0000
            });
        }

        const progress = await sendMessage(message, {
            title: '📊 Indexing Messages',
            description: 'Starting index process...',
            color: 0x2b2d31
        });

        const userMessages = new Map();
        let totalMessages = 0;
        let processedChannels = 0;
        const channels = message.guild.channels.cache.filter(
            channel => channel.type === 0
        );

        for (const [_, channel] of channels) {
            try {
                let lastMessageId;
                let messageCount = 0;

                while (true) {
                    const messages = await channel.messages.fetch({
                        limit: 100,
                        before: lastMessageId
                    });

                    if (messages.size === 0) break;

                    messages.forEach(msg => {
                        if (msg.author.bot) return;

                        const userData = userMessages.get(msg.author.id) || {
                            count: 0,
                            totalLength: 0
                        };

                        userData.count++;
                        userData.totalLength += msg.content.length;
                        userMessages.set(msg.author.id, userData);
                        totalMessages++;
                    });

                    lastMessageId = messages.last().id;
                    messageCount += messages.size;

                    if (messageCount % 1000 === 0) {
                        await progress.edit({
                            embeds: [{
                                title: '📊 Indexing Messages',
                                description: [
                                    `Processed ${processedChannels}/${channels.size} channels`,
                                    `Current channel: ${channel.name}`,
                                    `Total messages indexed: ${totalMessages}`,
                                    `Users tracked: ${userMessages.size}`
                                ].join('\n'),
                                color: 0x2b2d31
                            }]
                        });
                    }
                }

                processedChannels++;
            } catch (error) {
                console.error(`Error in channel ${channel.name}:`, error);
            }
        }

        for (const [userId, userData] of userMessages) {
            try {
                await database.run(`
                    INSERT INTO message_stats (user_id, guild_id, message_count, last_counted_timestamp)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(user_id, guild_id) DO UPDATE SET
                    message_count = message_count + ?,
                    last_counted_timestamp = ?
                `, [userId, message.guild.id, userData.count, Date.now(), userData.count, Date.now()]);
            } catch (error) {
                console.error(`Error updating message stats for user ${userId}:`, error);
            }
        }

        const assignProgress = await sendMessage(message, {
            title: '📊 Assigning XP',
            description: 'Starting XP assignment...',
            color: 0x2b2d31
        });

        let processedUsers = 0;
        for (const [userId, userData] of userMessages) {
            try {
                const avgLength = userData.totalLength / userData.count;
                let xpMultiplier = 1;
                
                if (avgLength > 50) xpMultiplier = 1.2;
                if (avgLength > 100) xpMultiplier = 1.5;
                if (avgLength > 200) xpMultiplier = 2;

                const baseXP = userData.count * 15;
                const bonusXP = Math.floor(baseXP * (xpMultiplier - 1));
                const totalXP = baseXP + bonusXP;

                await addXP(userId, message.guild.id, totalXP);

                const userRank = await getRank(userId, message.guild.id);
                if (userRank) {
                    const levelRoles = await levelRolesDb.all(
                        'SELECT level, role_id FROM level_roles WHERE guild_id = ? ORDER BY level ASC',
                        [message.guild.id]
                    );

                    try {
                        const member = await message.guild.members.fetch(userId).catch(() => null);
                        if (member) {
                            const existingLevelRoles = levelRoles.map(lr => lr.role_id);
                            await member.roles.remove(existingLevelRoles);
                    
                            const eligibleRoles = levelRoles
                                .filter(lr => lr.level <= userRank.level)
                                .map(lr => lr.role_id);
                    
                            if (eligibleRoles.length > 0) {
                                await member.roles.add(eligibleRoles);
                            }
                        }
                    } catch (error) {
                        console.error(`Error updating roles for user ${userId}:`, error);
                    }
                }

                processedUsers++;
                if (processedUsers % 10 === 0) {
                    await assignProgress.edit({
                        embeds: [{
                            title: '📊 Assigning XP',
                            description: [
                                `Processing user ${processedUsers}/${userMessages.size}`,
                                `XP assigned: ${totalXP}`,
                                'This may take a while...'
                            ].join('\n'),
                            color: 0x2b2d31
                        }]
                    });
                }
            } catch (error) {
                console.error(`Error processing user ${userId}:`, error);
            }
        }

        await sendMessage(message, {
            title: '✅ Indexing Complete',
            description: [
                `**Processed:**`,
                `• ${channels.size} channels`,
                `• ${totalMessages.toLocaleString()} messages`,
                `• ${userMessages.size} users`,
                '',
                'Users have been assigned XP based on:',
                '• Message count',
                '• Average message length',
                '',
                'Use `-rank` to check updated levels'
            ].join('\n'),
            color: 0x57f287
        });
    }
}; 
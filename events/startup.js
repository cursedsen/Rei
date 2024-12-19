import { sendMessage } from '../functions/reiMessageMaker.js';
import { botMasters } from '../config/botMasters.js';

export default {
    name: 'startup',
    once: true,
    async execute(client) {
        try {
            const firstBotMaster = await client.users.fetch(botMasters[0]);
            if (firstBotMaster) {
                await sendMessage(firstBotMaster, {
                    title: '✅ Rei is now online!',
                    description: [
                        '**Status:** Ready',
                        `**Latency:** ${client.ws.ping}ms`,
                        `**Guild Count:** ${client.guilds.cache.size}`,
                        `**User Count:** ${client.users.cache.size}`,
                        `**Channel Count:** ${client.channels.cache.size}`,
                        '',
                        '**System Info**',
                        `**Node:** ${process.version}`,
                        `**Platform:** ${process.platform}`,
                        `**Memory Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
                    ].join('\n'),
                    color: 0x57F287,
                    timestamp: true
                });
            }
        } catch (error) {
            console.error('Failed to send startup confirmation:', error);
        }
    }
};

import { sendMessage } from '../functions/reiMessageMaker.js';
import { botMasters } from '../config/botMasters.js';

export default {
    name: 'startup',
    once: true,
    async execute(client) {
        try {
            const firstBotMaster = await client.users.fetch(botMasters[0]);
            if (firstBotMaster) {
                const dmChannel = await firstBotMaster.createDM();
                await sendMessage(dmChannel, {
                    content: 'Rei is now online!',
                    embeds: [
                        {
                            description: [
                                '**Status:** Ready',
                                `**Latency:** ${client.ws.ping}ms`,
                            ].join('\n'),
                            color: 0x57F287,
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Failed to send startup confirmation:', error);
        }
    }
};

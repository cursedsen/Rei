import { readFileSync } from 'fs';
import { sendMessage } from '../functions/reiMessageMaker.js';

export default {
    name: 'messageCreate',
    async execute(message) {
        if (!message.mentions.has(message.client.user) || message.author.bot) return;

        const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
        const responses = strings.ping_responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        await sendMessage(message, {
            content: randomResponse
        });
    }
};

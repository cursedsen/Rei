import { sendMessage } from '../../functions/reiMessageMaker.js';
import { isBotMaster } from '../../config/botMasters.js';
import { exec } from 'child_process';

export default {
    name: 'restart',
    description: 'Restart Rei',
    category: 'admin',
    async execute(message) {
        if (!isBotMaster(message.author.id)) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'Only bot owners can restart Rei.',
                color: 0xFF0000
            });
        }

        await sendMessage(message, {
            title: 'Restarting...',
            description: 'The bot will restart momentarily.',
            color: 0xFFA500
        });

        exec('pm2 restart all', (error, stdout, stderr) => {
            if (error) {
                console.error(`PM2 restart error: ${error}`);
            }
        });
    }
}

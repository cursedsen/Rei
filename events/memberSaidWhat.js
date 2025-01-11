import { readFileSync } from 'fs';
import { AttachmentBuilder } from 'discord.js';

export default {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;

        const content = message.content.toLowerCase();
        
        if (content.includes('trampoline')) {
            try {
                const catGif = new AttachmentBuilder('./assets/gifs/catbounce.gif');
                const trampolineGif = new AttachmentBuilder('./assets/gifs/trampoline.gif');
                
                await message.channel.send({ files: [catGif] });
                
                setTimeout(async () => {
                    await message.channel.send({ files: [trampolineGif] });
                }, 500);
                
            } catch (error) {
                console.error('Error sending gifs:', error);
                await message.channel.send('Failed to send gifs');
            }
        }
        
        else if (content.includes(['tits', 'titties', 'boobs', 'boobies', 'honkers'])) {
            await message.reply('yeag');
        }
    }
};
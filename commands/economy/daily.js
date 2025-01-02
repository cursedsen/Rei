import { sendMessage } from '../../functions/reiMessageMaker.js';
import { claimDaily } from '../../functions/economyManager.js';

export default {
    name: 'daily',
    description: 'Claim your daily reward',
    category: 'economy',
    async execute(message, args) {
        const result = await claimDaily(message.author.id, message.guild.id);
        
        if (!result.success) {
            const timeLeft = Math.ceil(result.timeLeft / (1000 * 60 * 60));
            return await sendMessage(message, {
                title: '❌ Daily Reward',
                description: `You've already claimed your daily reward!\nCome back in ${timeLeft} hours.`,
                color: 0xff0000
            });
        }
        
        return await sendMessage(message, {
            title: '💰 Daily Reward',
            description: [
                `You received **${result.reward}** coins!`,
                `🔥 Current streak: **${result.streak}** days`,
                `✨ Streak bonus: **+${result.streakBonus}** coins`
            ].join('\n'),
            color: 0x57f287
        });
    }
}; 
import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getRank } from '../../functions/levelSystem.js';

export default {
    name: 'rank',
    description: 'Check your or another user\'s rank',
    category: 'levels',
    aliases: ['level', 'xp', 'stank'],
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const rank = await getRank(target.id, message.guild.id);

        if (!rank) {
            return await sendMessage(message, {
                description: 'This user hasn\'t earned any XP yet!',
                color: 0xff0000
            });
        }

        const progressBar = createProgressBar(rank.xpProgress, rank.xpNeeded);

        await sendMessage(message, {
            title: `${target.username}'s Rank`,
            description: [
                `**Level:** ${rank.level}`,
                `**Rank:** #${rank.rank}`,
                `**Total XP:** ${rank.xp}`,
                '',
                `**Progress to Level ${rank.level + 1}**`,
                progressBar,
                `${rank.xpProgress}/${rank.xpNeeded} XP`
            ].join('\n'),
            color: 0x2b2d31,
            thumbnail: target.displayAvatarURL({ dynamic: true })
        });
    }
};

function createProgressBar(current, max, length = 20) {
    const progress = Math.round((current / max) * length);
    const emptyProgress = length - progress;

    const progressText = '█'.repeat(progress);
    const emptyProgressText = '░'.repeat(emptyProgress);

    return progressText + emptyProgressText;
} 

import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getGameStats } from '../../functions/economyManager.js';

export default {
    name: 'stats',
    description: 'View your game statistics',
    category: 'economy',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const stats = await getGameStats(target.id, message.guild.id);
        
        const winRate = stats.games_played > 0
            ? ((stats.games_won / stats.games_played) * 100).toFixed(1)
            : 0;
            
        const betWinRate = stats.total_bets > 0
            ? ((stats.total_winnings / (stats.total_winnings + stats.total_losses)) * 100).toFixed(1)
            : 0;

        return await sendMessage(message, {
            title: `📊 ${target.username}'s Stats`,
            description: [
                '**Game Statistics**',
                `🎮 Games Played: **${stats.games_played}**`,
                `🏆 Games Won: **${stats.games_won}**`,
                `📈 Win Rate: **${winRate}%**`,
                '',
                '**Betting Statistics**',
                `🎲 Total Bets: **${stats.total_bets}**`,
                `💰 Total Winnings: **${stats.total_winnings}** coins`,
                `📉 Total Losses: **${stats.total_losses}** coins`,
                `🎯 Bet Win Rate: **${betWinRate}%**`,
                `💎 Net Profit: **${stats.total_winnings - stats.total_losses}** coins`
            ].join('\n'),
            color: 0x2b2d31
        });
    }
}; 
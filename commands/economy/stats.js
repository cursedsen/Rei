import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getPlayerStats } from '../../functions/statsManager.js';

export default {
    name: 'stats',
    description: 'View your game statistics',
    category: 'economy',
    async execute(message, args) {
        const stats = await getPlayerStats(message.author.id, 'buckshot');
        const winRate = stats.games_played > 0 
            ? ((stats.games_won / stats.games_played) * 100).toFixed(1)
            : 0;
        const betWinRate = stats.total_bets > 0
            ? ((stats.total_winnings / (stats.total_winnings + stats.total_losses)) * 100).toFixed(1)
            : 0;

        return await sendMessage(message, {
            title: `📊 ${message.author.username}'s Stats`,
            fields: [
                {
                    name: 'Game Statistics',
                    value: [
                        `🎮 Games Played: ${stats.games_played}`,
                        `🏆 Games Won: ${stats.games_won}`,
                        `📈 Win Rate: ${winRate}%`
                    ].join('\n')
                },
                {
                    name: 'Betting Statistics',
                    value: [
                        `🎲 Total Bets: ${stats.total_bets}`,
                        `💰 Total Winnings: ${stats.total_winnings} coins`,
                        `📉 Total Losses: ${stats.total_losses} coins`,
                        `🎯 Bet Win Rate: ${betWinRate}%`,
                        `💎 Net Profit: ${stats.total_winnings - stats.total_losses} coins`
                    ].join('\n')
                }
            ],
            color: 0x2b2d31
        });
    }
}; 
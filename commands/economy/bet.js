import { sendMessage } from '../../functions/reiMessageMaker.js';
import { placeBet, getActiveBets } from '../../functions/economyManager.js';
import { getGame } from '../../functions/buckshotManager.js';

export default {
    name: 'bet',
    description: 'Place a bet on a buckshot roulette game',
    category: 'economy',
    usage: '<amount> <@player>',
    async execute(message, args) {

        const game = getGame(message.channel.id);
        if (!game) {
            return await sendMessage(message, {
                description: 'No active game in this channel to bet on!',
                color: 0xff0000
            });
        }

        if (game.isGameOver()) {
            return await sendMessage(message, {
                description: 'The game is already over!',
                color: 0xff0000
            });
        }

        if (game.players.some(p => p.id === message.author.id)) {
            return await sendMessage(message, {
                description: 'You cannot bet on a game you are playing in!',
                color: 0xff0000
            });
        }

        const amount = parseInt(args[0]);
        if (!amount || isNaN(amount) || amount < 1) {
            return await sendMessage(message, {
                description: 'Please specify a valid bet amount!',
                color: 0xff0000
            });
        }

        const target = message.mentions.users.first();
        if (!target) {
            return await sendMessage(message, {
                description: 'Please mention a player to bet on!',
                color: 0xff0000
            });
        }

        if (!game.players.some(p => p.id === target.id)) {
            return await sendMessage(message, {
                description: 'That player is not in the game!',
                color: 0xff0000
            });
        }

        if (game.hp.get(target.id) <= 0) {
            return await sendMessage(message, {
                description: 'That player is already dead!',
                color: 0xff0000
            });
        }

        const existingBets = await getActiveBets(game.id);
        if (existingBets.some(bet => bet.user_id === message.author.id)) {
            return await sendMessage(message, {
                description: 'You already have an active bet on this game!',
                color: 0xff0000
            });
        }

        const result = await placeBet(game.id, message.author.id, message.guild.id, amount, target.id);
        if (!result.success) {
            return await sendMessage(message, {
                description: result.reason,
                color: 0xff0000
            });
        }

        return await sendMessage(message, {
            title: '✅ Bet Placed',
            description: [
                `You bet **${amount}** coins on ${target}!`,
                'If they win, you will receive double your bet.',
                'Good luck!'
            ].join('\n'),
            color: 0x57f287
        });
    }
}; 
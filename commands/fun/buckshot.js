import { sendMessage } from '../../functions/reiMessageMaker.js';
import { createGame, getGame, endGame } from '../../functions/buckshotManager.js';

export default {
    name: 'buckshot',
    description: 'Start a game of buckshot roulette',
    category: 'fun',
    usage: '<@player2> [@player3...]',
    async execute(message, args) {
        if (getGame(message.channel.id)) {
            return await sendMessage(message, {
                description: 'A game is already in progress in this channel!',
                color: 0xff0000
            });
        }

        const players = [message.author, ...message.mentions.users.values()];
        
        if (players.length < 2) {
            return await sendMessage(message, {
                description: 'You need at least 2 players! Mention other players to invite them.',
                color: 0xff0000
            });
        }

        const uniquePlayers = [...new Set(players.filter(p => !p.bot))];

        const game = createGame(message.channel.id, uniquePlayers);
        const currentPlayer = game.getCurrentPlayer();

        return await sendMessage(message, {
            title: '🎮 Buckshot Roulette',
            description: [
                `<@${currentPlayer.id}>'s turn!`,
                '',
                game.formatGameState(),
                '',
                '**Commands:**',
                '`-shoot self` - Shoot yourself',
                '`-shoot @player` - Shoot another player',
                '`-use <item_name>` - Use an item',
                '`-inv` - Check your inventory',
                '`-shop` - Buy items'
            ].join('\n'),
            color: 0x2b2d31
        });
    }
}; 
import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getGame, endGame } from '../../functions/buckshotManager.js';

export default {
    name: 'shoot',
    description: 'Shoot yourself or another player in buckshot roulette',
    category: 'fun',
    usage: '<self/@player/username>',
    async execute(message, args) {
        const game = getGame(message.channel.id);
        if (!game) {
            return await sendMessage(message, {
                description: 'No active game in this channel!',
                color: 0xff0000
            });
        }

        const currentPlayer = game.getCurrentPlayer();
        if (message.author.id !== currentPlayer.id) {
            return await sendMessage(message, {
                description: "It's not your turn!",
                color: 0xff0000
            });
        }

        let targetId;
        if (!args.length || args[0].toLowerCase() === 'self') {
            targetId = message.author.id;
        } else {
            let target = message.mentions.users.first();
            
            if (!target) {
                const targetName = args.join(' ').toLowerCase();
                target = game.players.find(p => 
                    p.username.toLowerCase() === targetName || 
                    p.username.toLowerCase().includes(targetName)
                );
            }

            if (!target) {
                return await sendMessage(message, {
                    description: 'Please specify "self", mention a player, or type their username to shoot!',
                    color: 0xff0000
                });
            }
            
            if (!game.hp.has(target.id)) {
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
            
            targetId = target.id;
        }

        const result = game.shoot(targetId);
        
        if (result.wasLive && result.remainingHp <= 0 && !result.wasRevived) {
            try {
                const member = await message.guild.members.fetch(targetId);
                await member.timeout(300000);
            } catch (error) {
                console.error(`Failed to mute player ${targetId}:`, error);
            }
        }

        const nextPlayer = game.getCurrentPlayer();

        await sendMessage(message, {
            description: [
                result.message,
                '',
                `<@${nextPlayer.id}>'s turn!`,
                '',
                game.formatGameState()
            ].join('\n'),
            color: result.wasLive ? 0xff0000 : 0x00ff00
        });

        const alivePlayers = Array.from(game.hp.entries()).filter(([_, hp]) => hp > 0);
        if (alivePlayers.length <= 1) {
            const winner = alivePlayers[0][0];
            endGame(message.channel.id);

            for (const player of game.players) {
                try {
                    const member = await message.guild.members.fetch(player.id);
                    await member.timeout(null);
                } catch (error) {
                    console.error(`Failed to unmute player ${player.id}:`, error);
                }
            }

            await sendMessage(message, {
                title: '🏆 Game Over!',
                description: `Winner: <@${winner}>!`,
                color: 0xffd700
            });
        }
    }
}; 
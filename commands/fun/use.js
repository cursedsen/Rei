import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getGame } from '../../functions/buckshotManager.js';
import { getInventory } from '../../functions/economyManager.js';

export default {
    name: 'use',
    description: 'Use an item in buckshot roulette',
    category: 'fun',
    usage: '<item_name>',
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

        if (!args.length) {
            return await sendMessage(message, {
                description: 'Please specify an item to use!',
                color: 0xff0000
            });
        }

        const itemName = args.join(' ').toLowerCase();
        
        const inventory = await getInventory(message.author.id, message.guild.id, 'buckshot');
        const item = inventory.find(i => i.name.toLowerCase() === itemName);
        
        if (!item) {
            return await sendMessage(message, {
                description: "You don't have that item!",
                color: 0xff0000
            });
        }

        const result = await game.useItem(message.author.id, message.guild.id, item.item_id);
        if (!result.success) {
            return await sendMessage(message, {
                description: result.reason,
                color: 0xff0000
            });
        }

        let content;
        switch (item.item_id) {
            case 1: // Magnifying Glass
                const nextShell = game.peekNextShell();
                content = `🔍 Next shell is ${nextShell ? 'live' : 'blank'}!`;
                break;
                
            case 2: // Handcuffs
                game.setHandcuffed(game.getNextPlayer().id);
                content = '⛓️ Next player must shoot twice!';
                break;
                
            case 3: // Beer
                const newHp = game.heal(message.author.id);
                content = `🍺 Healed 1 HP! (${newHp} HP)`;
                break;
                
            case 4: // Cigarette
                game.rotatePlayer();
                content = '🚬 Skipped turn!';
                break;
                
            case 5: // Mirror
                game.setReflected();
                content = '🪞 Next shot will be reflected!';
                break;

            case 6: // Saw
                const removed = game.removeLiveShell();
                content = removed 
                    ? '🪚 Removed a live shell from the chamber!'
                    : '🪚 No live shells found in the chamber!';
                break;

            case 7: // Blindfold
                game.setBlindfold(game.getNextPlayer().id);
                content = '🕶️ Next player must shoot randomly!';
                break;

            case 8: // Defibrillator
                game.addDefibrillator(message.author.id);
                content = '⚡ You will be revived with 1 HP if you die!';
                break;

            case 9: // Adrenaline
                game.setExtraTurn();
                content = '💉 You will get another turn after this one!';
                break;

            case 10: // Bulletproof Vest
                game.addVest(message.author.id);
                content = '🦺 You will survive one lethal shot!';
                break;
        }

        await sendMessage(message, {
            title: '🎒 Item Used',
            description: [
                content,
                '',
                game.formatGameState()
            ].join('\n'),
            color: 0x2b2d31
        });
    }
}; 
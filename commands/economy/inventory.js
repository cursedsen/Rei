import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getInventory } from '../../functions/economyManager.js';

export default {
    name: 'inventory',
    description: 'View your inventory',
    category: 'economy',
    aliases: ['inv'],
    async execute(message, args) {
        const inventory = await getInventory(message.author.id, message.guild.id);
        
        if (!inventory.length) {
            return await sendMessage(message, {
                title: '🎒 Your Inventory',
                description: 'Your inventory is empty! Use the shop to buy items.',
                color: 0x2b2d31
            });
        }

        const itemsByType = inventory.reduce((acc, item) => {
            if (!acc[item.item_type]) {
                acc[item.item_type] = [];
            }
            acc[item.item_type].push(item);
            return acc;
        }, {});

        const fields = Object.entries(itemsByType).map(([type, items]) => ({
            name: `📦 ${type.charAt(0).toUpperCase() + type.slice(1)} Items`,
            value: items.map(item => 
                `**${item.name}** (${item.quantity}x)\n*${item.description}*`
            ).join('\n\n')
        }));

        return await sendMessage(message, {
            title: '🎒 Your Inventory',
            description: 'Here are all your items:',
            fields,
            color: 0x2b2d31
        });
    }
}; 
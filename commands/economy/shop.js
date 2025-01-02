import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getShopItems, buyItem } from '../../functions/economyManager.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    name: 'shop',
    description: 'View and buy items from the shop',
    category: 'economy',
    usage: '[buy <item_id>]',
    async execute(message, args) {
        if (args[0]?.toLowerCase() === 'buy') {
            if (!args[1]) {
                return await sendMessage(message, {
                    description: 'Please specify an item ID to buy!',
                    color: 0xff0000
                });
            }

            const itemId = parseInt(args[1]);
            if (isNaN(itemId)) {
                return await sendMessage(message, {
                    description: 'Please provide a valid item ID!',
                    color: 0xff0000
                });
            }

            const result = await buyItem(message.author.id, message.guild.id, itemId);
            if (!result.success) {
                return await sendMessage(message, {
                    title: '❌ Purchase Failed',
                    description: result.reason,
                    color: 0xff0000
                });
            }

            return await sendMessage(message, {
                title: '✅ Purchase Successful',
                description: `You bought 1x ${result.item.name} for ${result.item.price} coins!`,
                color: 0x57f287
            });
        }

        const items = await getShopItems(message.guild.id);
        const buckshotItems = items.filter(item => item.item_type === 'buckshot');
        
        if (!items.length) {
            return await sendMessage(message, {
                title: '🏪 Shop',
                description: 'No items available!',
                color: 0x2b2d31
            });
        }

        const buttons = buckshotItems.map(item =>
            new ButtonBuilder()
                .setCustomId(`buy_${item.item_id}`)
                .setLabel(`Buy ${item.name}`)
                .setStyle(ButtonStyle.Success)
        );

        const rows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        const shopMsg = await sendMessage(message, {
            title: '🏪 Buckshot Roulette Shop',
            description: buckshotItems.map(item => 
                `**${item.item_id}.** ${item.name} - ${item.price} coins\n*${item.description}*`
            ).join('\n\n'),
            color: 0x2b2d31,
            footer: { text: 'Use the buttons below or type -shop buy <item_id> to purchase!' }
        });

        const collector = shopMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000
        });

        collector.on('collect', async (interaction) => {
            if (interaction.customId.startsWith('buy_')) {
                const itemId = parseInt(interaction.customId.split('_')[1]);
                const result = await buyItem(message.author.id, message.guild.id, itemId);
                
                await interaction.reply({
                    content: result.success
                        ? `✅ You bought 1x ${result.item.name} for ${result.item.price} coins!`
                        : `❌ ${result.reason}`,
                    ephemeral: true
                });
            }
        });

        collector.on('end', () => {
            shopMsg.edit({ components: [] });
        });
    }
}; 
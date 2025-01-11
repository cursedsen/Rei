import { sendMessage } from '../../functions/reiMessageMaker.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export default {
  name: 'help',
  description: 'Shows all available commands and how to use them',
  category: 'casual',
  usage: '[command]',
  aliases: ['commands', 'cmds', 'commandlist', 'commandlist'],
  async execute(message, args, commands) {
    if (args.length > 0) {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName);

      if (!command) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'That command does not exist.',
          color: 0xFF0000
        });
      }

      return await sendMessage(message, {
        title: `Command: ${command.name}`,
        description: [
          `**Description:** ${command.description || 'No description available'}`,
          `**Category:** ${command.category.charAt(0).toUpperCase() + command.category.slice(1)}`,
          command.usage ? `**Usage:** ${message.prefix}${command.name} ${command.usage}` : `**Usage:** ${message.prefix}${command.name}`,
          command.permissions ? `**Required Permissions:** ${command.permissions.join(', ')}` : ''
        ].join('\n'),
        color: 0x2B2D31
      });
    }

    const COMMANDS_PER_PAGE = 8;

    const sortedCommands = Array.from(commands.values()).sort((a, b) => {
      const categoryOrder = { casual: 1, fun: 2, moderation: 3 };
      return (categoryOrder[a.category] || 0) - (categoryOrder[b.category] || 0);
    });

    const totalPages = Math.ceil(sortedCommands.length / COMMANDS_PER_PAGE);
    let currentPage = 1;

    const generateEmbed = (page) => {
      const start = (page - 1) * COMMANDS_PER_PAGE;
      const end = start + COMMANDS_PER_PAGE;
      const pageCommands = sortedCommands.slice(start, end);

      let currentCategory = '';
      let description = '';

      pageCommands.forEach(cmd => {
        if (cmd.category && cmd.category !== currentCategory) {
          currentCategory = cmd.category;
          description += `\n**${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}**\n`;
        }
        description += `\`${cmd.name}\` - ${cmd.description || 'No description available'}\n`;
      });

      return {
        title: '📚 Command List',
        description: description || 'No commands available.',
        color: 0x2B2D31,
        footer: { text: `Page ${page} of ${totalPages}` }
      };
    };

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('⬅️'),
        new ButtonBuilder()
          .setCustomId('delete')
          .setLabel('Delete')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🗑️'),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➡️')
      );

    const initialMessage = await message.channel.send({
      embeds: [{
        ...generateEmbed(currentPage)
      }],
      components: [buttons]
    });

    const collector = initialMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        await interaction.reply({
          content: 'This button is not for you!',
          ephemeral: true
        });
        return;
      }

      await interaction.deferUpdate();

      if (interaction.customId === 'delete') {
        await initialMessage.delete();
        return;
      }

      if (interaction.customId === 'prev' && currentPage > 1) {
        currentPage--;
      } else if (interaction.customId === 'next' && currentPage < totalPages) {
        currentPage++;
      }

      await initialMessage.edit({
        embeds: [{
          ...generateEmbed(currentPage)
        }],
        components: [buttons]
      });
    });

    collector.on('end', () => {
      initialMessage.edit({ components: [] }).catch(() => { });
    });
  }
};

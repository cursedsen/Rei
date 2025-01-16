//works now :3 
import { sendMessage } from '../../functions/reiMessageMaker.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

export default {
  name: 'audit',
  description: 'View moderation actions taken by a staff member',
  category: 'moderation',
  permissions: ['ModerateMembers'],
  usage: '[user] [page]',
  async execute(message, args) {
    let targetModerator;
    if (args[0]) {
      targetModerator = message.mentions.members.first() ||
        await message.guild.members.fetch(args[0]).catch(() => null);

      if (!targetModerator) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'Could not find that user.',
          color: 0xFF0000
        });
      }
    } else {
      targetModerator = message.member;
    }

    const ITEMS_PER_PAGE = 5;
    let currentPage = args[1] ? parseInt(args[1]) : 1;

    async function fetchAndDisplayPage(pageNum) {
      const db = await open({
        filename: './serverData/auditLogs.db',
        driver: sqlite3.Database
      }).catch(error => {
        console.error('Database connection error:', error);
        return null;
      });

      if (!db) {
        return await sendMessage(message, {
          title: 'Error',
          description: 'Failed to connect to the database.',
          color: 0xFF0000
        });
      }

      try {
        const totalRecords = await db.get(
          `SELECT COUNT(*) as count FROM audit_logs 
                     WHERE moderator_name = ? AND guild_id = ?`,
          [targetModerator.id, message.guild.id]
        );

        const maxPages = Math.ceil(totalRecords.count / ITEMS_PER_PAGE);

        pageNum = Math.max(1, Math.min(pageNum, maxPages));

        const records = await db.all(
          `SELECT * FROM audit_logs 
                     WHERE moderator_name = ? 
                     AND guild_id = ?
                     ORDER BY timestamp DESC
                     LIMIT ? OFFSET ?`,
          [targetModerator.id, message.guild.id, ITEMS_PER_PAGE, (pageNum - 1) * ITEMS_PER_PAGE]
        );

        const emojis = {
          ban: '🔨',
          kick: '👢',
          mute: '🔇',
          unban: '🔓',
          unmute: '🔊',
          warn: '⚠️',
          timeout: '⏰'
        };

        let description = `***${targetModerator.user.tag}***\n`;
        description += `Mention: <@${targetModerator.id}>\n`;
        description += `ID: ${targetModerator.id}\n\n`;
        description += `Total Actions: ${totalRecords.count}\n`;
        description += `Page ${pageNum} of ${maxPages}\n\n`;

        records.forEach(record => {
          const emoji = emojis[record.command] || '📝';
          description += `${emoji} ${record.command.charAt(0).toUpperCase() + record.command.slice(1)}\n`;
          description += `Case ID: ${record.case_id}\n`;
          if (record.target_user_name) {
            description += `Target: <@${record.target_user_name}>\n`;
          }
          description += `When: <t:${Math.floor(record.timestamp / 1000)}:R>\n`;
          description += `Reason:\n${record.reason || 'No reason provided'}\n\n`;
        });

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('first')
              .setLabel('⏪ First')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(pageNum === 1),
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('◀️ Previous')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(pageNum === 1),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next ▶️')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(pageNum === maxPages),
            new ButtonBuilder()
              .setCustomId('last')
              .setLabel('Last ⏩')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(pageNum === maxPages)
          );

        return {
          embeds: [{
            title: 'Moderator Audit',
            description: description,
            color: 0xFFD700,
            timestamp: new Date(),
            thumbnail: { url: targetModerator.user.displayAvatarURL() },
            footer: { text: `Use %audit @user [page]` }
          }],
          components: [row]
        };
      } finally {
        await db.close();
      }
    }

    const initialMessage = await message.channel.send(await fetchAndDisplayPage(currentPage));

    const collector = initialMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
      filter: (i) => i.user.id === message.author.id
    });

    collector.on('collect', async (interaction) => {
      switch (interaction.customId) {
        case 'first':
          currentPage = 1;
          break;
        case 'previous':
          currentPage = Math.max(1, currentPage - 1);
          break;
        case 'next':
          currentPage++;
          break;
        case 'last':
          const db = await open({
            filename: './serverData/auditLogs.db',
            driver: sqlite3.Database
          });
          const totalRecords = await db.get(
            `SELECT COUNT(*) as count FROM audit_logs 
                         WHERE moderator_name = ? AND guild_id = ?`,
            [targetModerator.id, message.guild.id]
          );
          await db.close();
          currentPage = Math.ceil(totalRecords.count / ITEMS_PER_PAGE);
          break;
      }

      await interaction.update(await fetchAndDisplayPage(currentPage));
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('first')
            .setLabel('⏪ First')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('◀️ Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next ▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('last')
            .setLabel('Last ⏩')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

      await initialMessage.edit({ components: [disabledRow] }).catch(() => { });
    });
  }
};

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ComponentType } from "discord.js";

export async function sendMessage(target, options) {
  try {
    const messageOptions = {};

    if (options.content) {
      messageOptions.content = options.content;
    } else if (options.message) {
      messageOptions.content = options.message;
    }

    if (options.embeds) {
      messageOptions.embeds = options.embeds.map(
        (embed) => new EmbedBuilder(embed)
      );
    } else if (options.title || options.description) {
      const embed = new EmbedBuilder();
      if (options.title) embed.setTitle(options.title);
      if (options.description) embed.setDescription(options.description);
      if (options.color) embed.setColor(options.color);
      if (options.fields) embed.addFields(options.fields);
      if (options.thumbnail) embed.setThumbnail(options.thumbnail);
      if (options.image) embed.setImage(options.image);
      if (options.footer) embed.setFooter(options.footer);
      if (options.timestamp) embed.setTimestamp();

      messageOptions.embeds = [embed];
    }

    if (options.components) {
      messageOptions.components = options.components.map(row => {
        const actionRow = new ActionRowBuilder();

        row.forEach(component => {
          if (component.type === 'button') {
            const button = new ButtonBuilder()
              .setCustomId(component.customId)
              .setLabel(component.label)
              .setStyle(component.style);

            if (component.emoji) button.setEmoji(component.emoji);
            if (component.url) button.setURL(component.url);
            if (component.disabled) button.setDisabled(true);

            actionRow.addComponents(button);
          }
          else if (component.type === 'select') {
            const select = new StringSelectMenuBuilder()
              .setCustomId(component.customId)
              .setPlaceholder(component.placeholder)
              .addOptions(component.options);

            if (component.minValues) select.setMinValues(component.minValues);
            if (component.maxValues) select.setMaxValues(component.maxValues);
            if (component.disabled) select.setDisabled(true);

            actionRow.addComponents(select);
          }
        });

        return actionRow;
      });
    }

    if (options.ephemeral) {
      messageOptions.ephemeral = true;
    }

    if (target.reply && typeof target.reply === "function") {
      try {
        return await target.reply(messageOptions);
      } catch {
        return await target.channel.send(messageOptions);
      }
    } else {
      return await target.send(messageOptions);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

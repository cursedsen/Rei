import { EmbedBuilder } from "discord.js";

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

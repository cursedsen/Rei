import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';
import { readFileSync } from 'fs';

export default {
	name: 'kick',
	description: 'Kick a member from the server.',
	category: 'moderation',
	permissions: ['KickMembers'],
	usage: '<user> [reason]',
	execute: async (message, args) => {
		if (!args[0]) {
			return await sendMessage(message, {
				content: 'Please provide a valid user tag or ID to kick.'
			});
		}

		const reason = args.slice(1).join(' ') || 'No reason provided';
		let target = message.mentions.members.first() ||
			await message.guild.members.fetch(args[0]).catch(() => null);

		if (!target) {
			try {
				const user = await message.client.users.fetch(args[0]);
				return await sendMessage(message, {
					content: 'That user is not in the server.'
				});
			} catch (err) {
				return await sendMessage(message, {
					content: 'Could not find that user.'
				});
			}
		}

		if (target.id === message.author.id) {
			return await sendMessage(message, {
				content: 'Nice try.',
			});
		}

		if (!target.kickable) {
			return await sendMessage(message, {
				content: 'I cannot kick this user. They may have higher permissions than me.'
			});
		}

		try {
			try {
				await target.send({
					embeds: [{
						title: `👢 Kicked from ${message.guild.name}`,
						description: `You have been kicked by ${message.author.tag}\n**Reason:** ${reason}`,
						color: 0xFF6B6B,
						timestamp: new Date()
					}]
				});
			} catch (dmError) {
				console.log(`Could not send a DM to ${target.user.tag}`);
			}

			await target.kick(reason);

			const strings = JSON.parse(readFileSync('./things/strings.json', 'utf8'));
			const funnyRandomAction = strings.user_was_x[Math.floor(Math.random() * strings.user_was_x.length)];

			await sendMessage(message, {
				content: `${target.user.tag} was ${funnyRandomAction}`,
			});

			await logModAction(message, 'kick', target.user, reason);
		} catch (error) {
			console.error(error);
			await sendMessage(message, {
				content: 'An error occurred while trying to kick the user.'
			});
		}
	}
};
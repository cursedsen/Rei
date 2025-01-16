import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getServerConfig } from '../../functions/serverConfig.js';

export default {
  name: 'mute',
  description: 'Mute a user',
  category: 'moderation',
  permissions: ['MuteMembers'],
  async execute(message, args) {
    if (!args[0]) {
      return await sendMessage(message, {
        content: 'Please provide a valid user tag or ID to mute.'
      });
    }

    const target = message.mentions.members.first() ||
      await message.guild.members.fetch(args[0]).catch(() => null);

    if (!target) {
      return await sendMessage(message, {
        content: 'Could not find that user.'
      });
    }
    if (target.id === message.author.id) {
      return await sendMessage(message, {
        content: 'Nice try.',
      });
    }
    if (!target.moderatable) {
      return await sendMessage(message, {
        content: 'I cannot mute this user. They may have higher permissions than me.'
      });
    }

    const serverConfig = await getServerConfig(message.guild.id);
    const muteRole = serverConfig.mute_role ?
      await message.guild.roles.fetch(serverConfig.mute_role).catch(() => null) : null;

    const timeString = args[1]?.toLowerCase();
    let duration = 0;
    let isPermanent = false;

    if (!timeString || !['m', 'h', 'd'].some(unit => timeString.endsWith(unit))) {
      if (!muteRole) {
        return await sendMessage(message, {
          content: 'No mute role has been set up for permanent mutes. Please set one up using the config command or provide a valid duration (e.g. 1h, 30m, 1d).'
        });
      }
      isPermanent = true;
    } else {
      if (timeString.endsWith('m')) duration = parseInt(timeString) * 60 * 1000;
      else if (timeString.endsWith('h')) duration = parseInt(timeString) * 60 * 60 * 1000;
      else if (timeString.endsWith('d')) duration = parseInt(timeString) * 24 * 60 * 60 * 1000;

      if (isNaN(duration) || duration <= 0) {
        if (!muteRole) {
          return await sendMessage(message, {
            content: 'Invalid duration and no mute role set up for permanent mutes.'
          });
        }
        isPermanent = true;
      }
    }

    const reason = args.slice(isPermanent ? 1 : 2).join(' ') || 'No reason provided';

    try {
      if (isPermanent) {
        await target.roles.add(muteRole);
      } else {
        await target.timeout(duration, reason);
      }

      try {
        await target.send({
          embeds: [{
            title: `You were muted in ${message.guild.name}`,
            description: `**Duration:** ${isPermanent ? 'Permanent' : timeString}\n**Reason:** ${reason}`,
            color: 0xFF0000,
          }]
        });
      } catch (dmError) {
        console.log(`Could not send a DM to <@${target.id}>`);
      }

      await sendMessage(message, {
        content: `Ok, <@${target.id}> was ${isPermanent ? 'permanently' : 'temporarily'} muted for: ${reason}`
      });
    } catch (error) {
      console.error(error);
      await sendMessage(message, {
        content: 'An error occurred while trying to mute the user.'
      });
    }
  }
}

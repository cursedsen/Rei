import { logModAction } from '../functions/auditLogger.js';

const MONITORED_GAMES = ['League of Legends', 'VALORANT'];
const TIME_THRESHOLD = 30 * 60 * 1000;
const userTimers = new Map();

export default {
  name: "presenceUpdate",
  async execute(oldPresence, newPresence) {
    if (!newPresence || !newPresence.activities) return;

    const gameActivity = newPresence.activities.find(activity =>
      MONITORED_GAMES.includes(activity.name)
    );

    if (gameActivity) {
      if (!userTimers.has(newPresence.userId)) {
        userTimers.set(newPresence.userId, {
          gameName: gameActivity.name,
          startTime: Date.now()
        });
      }
    } else {
      userTimers.delete(newPresence.userId);
      return;
    }

    const timer = userTimers.get(newPresence.userId);
    if (!timer) return;

    const elapsedTime = Date.now() - timer.startTime;

    if (elapsedTime >= TIME_THRESHOLD) {
      try {
        const member = await newPresence.member.fetch();
        if (!member.bannable) return;

        await member.ban({
          reason: `Playing ${timer.gameName} for more than 30 minutes`
        });

        await logModAction(
          { guild: newPresence.guild, author: newPresence.client.user },
          'ban',
          member.user,
          `Auto-banned for playing ${timer.gameName} for more than 30 minutes`
        );

        userTimers.delete(newPresence.userId);
      } catch (error) {
        console.error('Error in kickForStatus:', error);
      }
    }
  }
};
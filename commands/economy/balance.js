import { sendMessage } from '../../functions/reiMessageMaker.js';
import { getBalance } from '../../functions/economyManager.js';

export default {
  name: 'balance',
  description: 'Check your or another user\'s balance',
  category: 'economy',
  aliases: ['bal', 'money'],
  async execute(message, args) {
    const target = message.mentions.users.first() || message.author;
    const { balance, bankBalance } = await getBalance(target.id, message.guild.id);

    return await sendMessage(message, {
      title: `💰 ${target.username}'s Balance`,
      description: [
        `👛 Wallet: **${balance}** coins`,
        `🏦 Bank: **${bankBalance}** coins`,
        `💎 Total: **${balance + bankBalance}** coins`
      ].join('\n'),
      color: 0x2b2d31
    });
  }
}; 
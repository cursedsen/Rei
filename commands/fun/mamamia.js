import { sendMessage } from '../../functions/reiMessageMaker.js';
import { logModAction } from '../../functions/auditLogger.js';

export default {
  name: 'mamamia',
  description: "Mama mia's your message",
  category: 'fun',
  usage: '<text>',

  execute: async (message, args) => {
    let text;
    if (!args.length) {
      const messages = await message.channel.messages.fetch({ limit: 2 });
      const previousMessage = messages.last();

      if (!previousMessage || !previousMessage.content) {
        return await sendMessage(message, {
          title: 'Mamma Mia! 🤌',
          description: 'Where\'s-a da message? I can\'t cook-a da pasta without-a da ingredients! 🍝',
          color: 0xFF0000
        });
      }
      text = previousMessage.content;
    } else {
      text = args.join(' ');
    }

    if (/@(everyone|here|&\d+)/.test(text)) {
      try {
        await message.member.timeout(5 * 60 * 1000, 'Attempted mention exploitation');
        await logModAction(message, 'timeout', message.author, 'Tried to pull a sneaky with the mamamia command!');
        await sendMessage(message, {
          content: `Ay! 🤌 You try to ping-a everyone? That's-a not very cash money of-a you! To the timeout corner! 🍝`,
          color: 0xFF0000
        });
        return;
      } catch (error) {
        console.error('Failed to timeout user:', error);
      }
    }

    text = text.replace(/@(everyone|here|&\d+)/g, '@\u200b$1');

    let italianText = text
      .replace(/\b(my)\b/gi, 'a-my')
      .replace(/\b(me)\b/gi, 'a-me')
      .replace(/\b(i am)\b/gi, 'i-a am-a')
      .replace(/\b(i'm)\b/gi, "i'm-a")
      .replace(/\b(the)\b/gi, 'da')
      .replace(/\b(this)\b/gi, 'dis-a')
      .replace(/\b(that)\b/gi, 'dat-a')
      .replace(/\b(is)\b/gi, 'issa')
      .replace(/\b(are)\b/gi, 'arra')
      .replace(/\b(you)\b/gi, 'yu')
      .replace(/ing\b/gi, 'inga')
      .replace(/\b(yes)\b/gi, 'si')
      .replace(/\b(no)\b/gi, 'no-a')
      .replace(/\b(what)\b/gi, 'wat-a')
      .replace(/\b(why)\b/gi, 'why-a')
      .replace(/\b(where)\b/gi, 'where-a')
      .replace(/\b(when)\b/gi, 'when-a')
      .replace(/\b(how)\b/gi, 'how-a')
      .replace(/\b(good)\b/gi, 'molto bene')
      .replace(/\b(bad)\b/gi, 'molto male')
      .replace(/\b(hello)\b/gi, 'ciao')
      .replace(/\b(hi)\b/gi, 'ciao')
      .replace(/\b(bye)\b/gi, 'arrivederci')
      .replace(/\b(goodbye)\b/gi, 'arrivederci')
      .replace(/\b(friend)\b/gi, 'paisan')
      .replace(/\b(friends)\b/gi, 'paisanos')
      .replace(/!+/g, '-a! 🤌');

    italianText = italianText.replace(/\b(\w+)\b/g, (word) => {
      return Math.random() < 0.3 ? `${word}-a` : word;
    });

    const starters = [
      'Mama mia! ',
      'Madonna santa! ',
      'Ay, que bella! ',
      'Per tutti i ravioli! ',
      'Santo cannoli! ',
      'Porca pizza! ',
      'Sacro formaggio! ',
      'By-a da power of-a da pasta! ',
      'Mamma mia pizzeria! ',
      'Holy cannelloni! ',
      'Che pasta! ',
      'Dio mio! ',
      'Per la pasta! ',
    ];

    const endings = [
      ' 🤌 Capisce?',
      ' 🍝 That\'s-a what I call Italian-a style!',
      ' 🍕 Just like-a mama used to make!',
      ' 🧄 Spicier than-a my mama\'s meatballs!',
      ' 🤌 Bellissimo!',
      ' 🍷 Magnifico!',
      ' 🫒 That\'s-a amore!',
      ' 🌶️ Molto piccante!',
      ' 🧀 Parmigiano Reggiano!',
      ' 🍅 Mamma mia, che sapore!',
      ' 🥖 *Italian hand gestures intensify*',
      ' 🎭 Just like-a da Shakespeare wrote it!',
      ' 👨‍🍳 *chef\'s kiss*',
      ' 🎻 *plays Tarantella Napoletana*',
    ];

    const emphasisWords = [
      '*waves hands* ',
      '*adjusts chef hat* ',
      '*twirls mustache* ',
      '*stirs sauce* ',
      '*tosses pizza dough* ',
      '*grates parmesan* ',
      '*rolls meatballs* ',
      '*kisses fingers* ',
      '*plays accordion* ',
      '*dances tarantella* ',
    ];

    const foodEmojis = ['🍝', '🍕', '🧀', '🍷', '🧄', '🫒', '🍅', '🌶️', '🥖', '👨‍🍳', '🤌'];

    italianText = italianText.split(' ').map(word => {
      return Math.random() < 0.15 ?
        `${word} ${foodEmojis[Math.floor(Math.random() * foodEmojis.length)]}` :
        word;
    }).join(' ');

    let finalMessage = '';

    if (Math.random() < 0.7) {
      finalMessage += starters[Math.floor(Math.random() * starters.length)];
    }

    if (Math.random() < 0.3) {
      finalMessage += emphasisWords[Math.floor(Math.random() * emphasisWords.length)];
    }

    finalMessage += italianText;

    if (Math.random() < 0.8) {
      finalMessage += endings[Math.floor(Math.random() * endings.length)];
    }

    if (Math.random() < 0.1) {
      finalMessage += '\n\n*Somewhere in the distance, Mario says: "Yahoo! It\'s-a me!"* 🎮';
    }

    await sendMessage(message, {
      content: finalMessage
    });
  }
};

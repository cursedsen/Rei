import { sendMessage } from '../../functions/reiMessageMaker.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json')));

export default {
  name: 'about',
  description: 'Information about Rei and its developers',
  category: 'casual',
  aliases: ['info', 'botinfo', 'bot'],
  async execute(message) {
    await sendMessage(message, {
      title: 'About Rei',
      description: [
        '**Multi-purpose bot made for humans**',
        'developed by [CursedSen](https://github.com/cursedsen)',
        '',
        '**Core Features**',
        '• Comprehensive moderation tools',
        '• User leveling system with rewards',
        '• Customizable server settings',
        '',
        '**Links**',
        '• [GitHub repository](https://github.com/cursedsen/Rei)',
        '• [Documentation](https://sen.wtf/rei) (WIP)',
        '',
        `**Version:** ${packageJson.version}`,
        `**Prefix:** ${message.prefix || '-'}`,
        '',
        '*This bot is a passion project and exam material.*',
        '*Contributions are super welcome!*',
        '*Some things may be broken. Please report any issues to the [my developer](https://github.com/cursedsen)*',
      ].join('\n'),
      color: 0x2B2D31,
      thumbnail: message.client.user.displayAvatarURL()
    });
  }
};
import { sendMessage } from '../../functions/reiMessageMaker.js';
import { ButtonStyle } from 'discord.js';

export default {
  name: 'test',
  description: 'Tests ReiMessageMaker functionality',
  category: 'moderation',
  permissions: ['Administrator'],
  async execute(message, args) {
    await sendMessage(message, {
      content: '**Direct content test**',

      title: '📝 ReiMessageMaker Test Suite',
      description: 'This message tests all available ReiMessageMaker features',
      color: 0x2B2D31,

      fields: [
        {
          name: '📋 Regular Field',
          value: 'Standard field test'
        },
        {
          name: '📊 Inline Fields',
          value: 'Left',
          inline: true
        },
        {
          name: '\u200B',
          value: 'Center',
          inline: true
        },
        {
          name: '\u200B',
          value: 'Right',
          inline: true
        }
      ],

      thumbnail: message.author.displayAvatarURL(),
      image: message.guild.bannerURL() || message.guild.iconURL(),

      footer: {
        text: `Requested by ${message.author.tag}`,
        icon_url: message.author.displayAvatarURL()
      },
      timestamp: true,

      components: [
        [
          {
            type: 'button',
            customId: 'test_button1',
            label: 'Primary',
            style: ButtonStyle.Primary
          },
          {
            type: 'button',
            customId: 'test_button2',
            label: 'Success',
            style: ButtonStyle.Success,
            emoji: '✅'
          },
          {
            type: 'button',
            label: 'Link',
            style: ButtonStyle.Link,
            url: 'https://github.com'
          }
        ],
        [
          {
            type: 'select',
            customId: 'test_select',
            placeholder: 'Select an option',
            options: [
              {
                label: 'Option 1',
                description: 'First option',
                value: 'opt1',
                emoji: '1️⃣'
              },
              {
                label: 'Option 2',
                description: 'Second option',
                value: 'opt2',
                emoji: '2️⃣'
              }
            ]
          }
        ]
      ]
    });
  }
};
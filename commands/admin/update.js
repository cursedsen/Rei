export default {
    name: 'update',
    description: 'Pulls the latest changes from the git repository',
    async execute(message) {
        if (!isBotMaster(message.author.id)) {
            return await sendMessage(message, {
                title: 'Access Denied',
                description: 'Only bot owners can pull the latest changes.',
                color: 0xFF0000
            });
        }

        const { exec } = require('child_process');
        
        try {
            exec('git pull', { cwd: process.cwd() }, (error, stdout, stderr) => {
                if (error) {
                    return message.reply(`Error: ${error.message}`);
                }
                if (stderr) {
                    return message.reply(`Warning: ${stderr}`);
                }
                message.reply(`Successfully pulled changes:\n\`\`\`${stdout}\`\`\``);
            });
        } catch (error) {
            message.reply('Failed to execute git pull command.');
            console.error('Git pull error:', error);
        }
    }
};

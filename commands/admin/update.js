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

        const { promisify } = require('util');
        const { exec } = require('child_process');
        const execAsync = promisify(exec);
        
        try {
            const { stdout, stderr } = await execAsync('git pull', { cwd: process.cwd() });
            
            if (stderr && !stderr.includes('Already up to date')) {
                await message.reply(`Warning: ${stderr}`);
                return;
            }
            
            await message.reply(`Successfully pulled changes:\n\`\`\`${stdout}\`\`\``);
        } catch (error) {
            await message.reply(`Failed to execute git pull command: ${error.message}`);
            console.error('Git pull error:', error);
        }
    }
};

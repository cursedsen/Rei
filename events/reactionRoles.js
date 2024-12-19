import { getReactionRoles } from '../functions/reactionRoles.js';

export default [
    {
        name: 'messageReactionAdd',
        async execute(reaction, user) {
            if (user.bot) return;
            
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    return;
                }
            }

            const reactionRoles = await getReactionRoles(reaction.message.id);
            const roleConfig = reactionRoles.find(r => r.emoji === reaction.emoji.name);

            if (roleConfig) {
                const member = await reaction.message.guild.members.fetch(user.id);
                const role = await reaction.message.guild.roles.fetch(roleConfig.role_id);
                
                if (role && member) {
                    try {
                        await member.roles.add(role);
                    } catch (error) {
                        console.error('Failed to add role:', error);
                    }
                }
            }
        }
    },
    {
        name: 'messageReactionRemove',
        async execute(reaction, user) {
            if (user.bot) return;
            
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    return;
                }
            }

            const reactionRoles = await getReactionRoles(reaction.message.id);
            const roleConfig = reactionRoles.find(r => r.emoji === reaction.emoji.name);

            if (roleConfig) {
                const member = await reaction.message.guild.members.fetch(user.id);
                const role = await reaction.message.guild.roles.fetch(roleConfig.role_id);
                
                if (role && member) {
                    try {
                        await member.roles.remove(role);
                    } catch (error) {
                        console.error('Failed to remove role:', error);
                    }
                }
            }
        }
    }
]; 
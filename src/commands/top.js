const { CommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { intoBal } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Ver el top de usuarios con mas dinero')
        .setDMPermission(false),
    /**
     * @param {CommandInteraction} interaction 
     */
    async run(interaction) {
        await interaction.deferReply();
        const client = interaction.client;
        const sequelize = await database(false);
        let Wallet = require('../utils/models/wallet')(sequelize);
        const embed = new EmbedBuilder()
            .setAuthor({ 'name': interaction.guild.name })
            .setColor('Green')
            .setTimestamp()
            .setFooter({ 'text': 'NEconomy Bot' });
        let allWallets;

        try {
            await sequelize.authenticate();
            allWallets = await Wallet.findAll({
                raw: true
            });
        } catch (error) {
            console.log(`[${__filename}] Hubo un error con la base de datos:`, error);
            return;
        }

        if (!allWallets) {
            embed.setDescription('No hay datos.');
            await interaction.editReply({ embeds: [embed] });
            return;
        }

        let topDesc = '';
        allWallets.sort((a, b) => b.balance - a.balance)
            .every((wallet, index) => {
                let thisUser = wallet.user_id;
                topDesc += `${index + 1}-<@${thisUser}> ${intoBal(wallet.balance)}\n`;
                if (index > 9) return false;
                return true;
            });
        embed.setFields({ 'name': '-Top 10-', 'value': topDesc });

        await interaction.editReply({ embeds: [embed] });
    }
}
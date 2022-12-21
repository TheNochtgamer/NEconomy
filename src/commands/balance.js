const { CommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { intoBal, WalletDAO } = require('../utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Obtiene tu dinero actual')
        .setDMPermission(false),
    /**
     * @param {CommandInteraction} interaction 
     */
    async run(interaction) {
        const member = interaction.member;
        const sequelize = await database(false);
        let Wallet = require('../utils/models/wallet')(sequelize);
        let myWallet = member.wallet;
        let embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ 'name': member.user.username, 'iconURL': member.user.avatarURL() || member.user.defaultAvatarURL() })
            .setTimestamp()
            .setFooter({'text': 'NEconomy Bot'});

        if (!myWallet) {
            try {
                await sequelize.authenticate();
                let hasWallet = await Wallet.findOne({
                    where: {
                        user_id: member.id
                    },
                    raw: true
                });

                member.wallet = new WalletDAO(member.id, hasWallet?.balance || 0);
                myWallet = member.wallet;
            } catch (error) {
                console.log(`[${__filename}] Hubo un error con la base de datos:`, error);
                return;
            }
        }


        embed.setDescription(`Balance: ${intoBal(myWallet.balance)}`);
        await interaction.reply({ embeds: [embed] });
    }
}
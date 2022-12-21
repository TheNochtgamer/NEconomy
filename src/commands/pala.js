const { CommandInteraction, SlashCommandBuilder } = require('discord.js');
const { intoBal, WalletDAO, randMsg } = require('../utils');

// const firstRand = Math.floor(Math.random() * 10 + 1);
const maxBal = 400;
const minBal = 100;
const messages = [
    'moviendo escombros en una construccion',
    'sacando troncos en una plaza'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pala')
        .setDescription('Trabaja y consigue dinero')
        .setDMPermission(false),
    /**
     * @param {CommandInteraction} interaction 
     */
    async run(interaction) {
        const member = interaction.member;
        genBalance = Math.floor(Math.random() * (maxBal - minBal + 1) + minBal);
        const sequelize = await database(false);
        let Wallet = require('../utils/models/wallet')(sequelize);
        let myWallet = member.wallet;

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

        if (!myWallet.canPala()) {
            let timeoutMoment = member.wallet.nextPala.unix();
            interaction.reply({ content: `Aun no puedes trabajar.\nTienes que esperar: <t:${timeoutMoment}:R>` });
            return;
        };

        myWallet.addBal(genBalance);
        await interaction.reply({ content: `Conseguiste ${intoBal(genBalance)} ${randMsg(messages)}!` });

        try {
            await sequelize.authenticate();
            let rows = await Wallet.update(myWallet, {
                where: {
                    user_id: member.id
                },
            });
            if (!rows[0]) {
                await Wallet.create(myWallet);
            }
        } catch (error) {
            console.log(`[${__filename}] Hubo un error con la base de datos:`, error);
            return;
        }
    }
}
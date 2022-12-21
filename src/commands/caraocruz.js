const { CommandInteraction, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { WalletDAO, intoBal } = require('../utils');
const firstRand = Math.floor(Math.random() * 100 + 1);
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('caraocruz')
        .setDescription('Si te sale lo que seleccionaste ganas el doble de lo apostado')
        .setDMPermission(false)
        .addStringOption(op => op
            .setName('lado')
            .setDescription('El lado de la moneda que queres que caiga')
            .setRequired(true)
            .setChoices(
                { 'name': 'cara', 'value': '0' },
                { 'name': 'cruz', 'value': '1' }))
        .addNumberOption(op => op
            .setName('balance')
            .setDescription('El balance a apostar')
            .setRequired(true)
            .setMinValue(0)),
    /**
     * @param {CommandInteraction} interaction 
     */
    async run(interaction) {
        const lado = parseInt(interaction.options.get('lado', true).value);
        const balance = interaction.options.get('balance', true).value;
        const member = interaction.member;
        const sequelize = await database(false);
        const moneda = { value: (Math.floor(Math.random() * 100 + 1) + firstRand) % 2 };
        moneda.msg = moneda.value ? 'cruz' : 'cara';
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

        if (config.minBalCaraoCruz > balance) {
            await interaction.reply({ 'content': `El minimo de apuesta es ${config.minBalCaraoCruz}` });
            return;
        }
        if (myWallet.balance < balance) {
            await interaction.reply({ 'content': 'No tenes dinero suficiente para apostar' });
            return;
        }
        myWallet.takeBal(balance);

        if (moneda.value == lado) {
            embed.setDescription(`La moneda cayo del lado de ${moneda.msg}
            Ganaste +${intoBal(balance)}!`);
            myWallet.addBal(balance * 2);
        } else {
            embed.setDescription(`Elegiste ${lado ? 'cruz' : 'cara'}
            y la moneda cayo del lado de ${moneda.msg}
            Perdiste -${intoBal(balance)}!`);
        }

        await interaction.reply({ 'embeds': [embed] });

        try {
            await sequelize.authenticate();
            await Wallet.update(myWallet, {
                where: {
                    user_id: member.id
                },
            });
        } catch (error) {
            console.log(`[${__filename}] Hubo un error con la base de datos:`, error);
            return;
        }
    }
}
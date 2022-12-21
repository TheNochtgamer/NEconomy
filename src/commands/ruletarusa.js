const { CommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { intoBal, WalletDAO } = require('../utils');
const firstRand = Math.floor(Math.random() * 100 + 1);
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ruletarusa')
        .setDescription('Para desafiar a alguien mas a jugar a la ruleta rusa')
        .addUserOption(op => op
            .setName('usuario')
            .setDescription('El usuario a desafiar')
            .setRequired(true))
        .addNumberOption(op => op
            .setName('balance')
            .setDescription('El balance a apostar')
            .setRequired(true)
            .setMinValue(0)),
    /**
     * @param {CommandInteraction} interaction 
     */
    async run(interaction) {
        const otherMember = interaction.options.getMember('usuario', true);
        const balance = interaction.options.get('balance', true).value;
        const member = interaction.member;
        const sequelize = await database(false);
        let Wallet = require('../utils/models/wallet')(sequelize);
        let myWallet = member.wallet;
        let embed = new EmbedBuilder()
            .setColor('Green')
            .setAuthor({ 'name': 'Ruleta Rusa' })
            .setTimestamp()
            .setFooter({ 'text': 'NEconomy Bot' });

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

        // if (otherMember.user?.bot) {
        //     await interaction.reply({ 'content': 'No podes desafiar a un bot' });
        //     return;
        // }
        // if (otherMember.id === member.id) {
        //     await interaction.reply({ 'content': `No te podes desafiar a tu mismo` });
        //     return;
        // }
        if (config.minBalRuletaRusa > balance) {
            await interaction.reply({ 'content': `El minimo de apuesta es ${config.minBalRuletaRusa}` });
            return;
        }
        if (myWallet.balance < balance) {
            await interaction.reply({ 'content': 'No tenes dinero suficiente para apostar' });
            return;
        }
        if (otherMember.wallet?.balance < balance || !otherMember.wallet) {
            await interaction.reply({ 'content': 'EL usuario que desafiaste no tiene dinero suficiente' });
            return;
        }

        embed.setDescription(`${member.user} te esta desafiando a jugar a la ruleta rusa.
        Apuesta: ${intoBal(balance)}`);
        let row = new ActionRowBuilder().addComponents([
            new ButtonBuilder().setCustomId('accept').setStyle(ButtonStyle.Primary).setLabel('✅'),
            new ButtonBuilder().setCustomId('deny').setStyle(ButtonStyle.Danger).setLabel('❌'),
        ]);

        let reply = await interaction.reply({ 'content': otherMember.user.toString(), 'embeds': [embed], 'components': [row] });
        let button;

        try {
            button = await reply.awaitMessageComponent({
                'filter': i => i.user.id === member.id || i.user.id == otherMember.id,
                'time': config.ruletaRusaIdleTimeoutS * 1000
            });
        } catch (error) {
            embed.setDescription(`${otherMember.user} no acepto a tiempo.`);
            await interaction.editReply({ 'embeds': [embed], 'components': [] });
            return;
        }
        console.log(button)
        if (!button?.isButton()) return;

        if (button.customId == 'deny') {
            embed.setDescription(`Ruleta cancelada.`);
            await interaction.editReply({ 'embeds': [embed], 'components': [] });
            return;
        } else {
            myWallet.takeBal(balance); otherMember.wallet.takeBal(balance);

            let rand = ((Math.floor(Math.random() * 100 + 1) + firstRand) % 2);
            let resultados = { 'win': rand ? member : otherMember, 'lost': rand ? otherMember : member };
            resultados.win.wallet.addBal(balance * 2);

            embed.setDescription(`El sobreviviente es ${resultados.user}.
            ${resultados.win.user} +${intoBal(balance * 2)}
            ${resultados.lost.user} -${intoBal(balance)}`);
            await interaction.editReply({ 'embeds': [embed], 'components': [] });
        }

        try {
            await sequelize.authenticate();
            await Wallet.update(myWallet, {
                where: {
                    user_id: member.id
                },
            });
            await Wallet.update(otherMember.wallet, {
                where: {
                    user_id: otherMember.id
                },
            });
        } catch (error) {
            console.log(`[${__filename}] Hubo un error con la base de datos:`, error);
            return;
        }
    }
}
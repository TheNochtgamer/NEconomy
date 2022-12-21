require("dotenv").config();
const Discord = require('discord.js');
const fs = require('fs');

const client = new Discord.Client({
    intents: ['Guilds', 'GuildMembers']
});
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
const forceReloadCmds = false;

client.commands = new Discord.Collection();

globalThis.database = require("./utils/database");

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.name == 'ready' || event.once) {
        client.once(event.name, (...args) => event.run(...args));
    } else {
        client.on(event.name, (...args) => event.run(...args));
    }
}

(async function init() {
    await client.login(process.env.TOKEN);
    (async () => {
        try {
            let cmds = await client.application.commands.fetch();
            let allCommandsLoaded = cmds.every(cmd => client.commands.has(cmd.name));
            
            allCommandsLoaded = client.commands.every(localcmd => cmds.some(cmd => cmd.name === localcmd.data?.name));

            if (allCommandsLoaded && !forceReloadCmds) { return } else { console.log('Comandos desactualizados, sincronizando...') };
            require('./utils/cargarCmds')(client.user.id);
        } catch (error) {
            console.log('Hubo un error al intentar sincronizar los comandos a discord:', error);
        }
    })();

    (async () => {
        try {
            let sequelize = await database(false);
            require('./utils/models/wallet')(sequelize);

            await sequelize.authenticate();
            sequelize.sync();
        } catch (error) {
            console.log('Hubo un error al intentar sincronizar las tablas de la base de datos:', error);
        }
    })();
})();
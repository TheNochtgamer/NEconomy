require("dotenv").config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = (clientId) => {
    const commands = [];
    console.log('[P] Leyendo archivos...');
    const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

    console.log('[P] Analizando archivos...');
    for (const file of commandFiles) {
        console.log('[file] ' + file + ' :');
        const command = require(`../commands/${file}`);
        if (command.button) { console.log(`[name] ^ Skipping button "${command.button().customId}"...`); continue };
        console.log('[name] ^ ' + command.data?.name);

        if (!command.raw) {
            commands.push(command.data.toJSON());
        } else {
            commands.push(command.data);
        }
    }

    (() => {
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        rest.put(Routes.applicationCommands(clientId), { body: commands })
            .then(_ => {
                console.log('[P] Comandos cargados correctamente.');
            })
            .catch(console.error);
    })();
}
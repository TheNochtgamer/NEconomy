module.exports = {
    name: 'ready',
    run(client) {
        console.log(`Bot online como ${client.user.tag}`);
    }
}
module.exports = {
    intoBal(msg) { return '💵`' + msg + '`' },
    WalletDAO: require('./dao/walletCls'),
    randMsg(msgArr) {
        return msgArr.at(Math.floor(Math.random() * msgArr.length));
    },
};
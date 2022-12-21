const moment = require('moment');
const config = require('../../config.json');

class WalletDAO {
    constructor(userId, balance = 0) {
        this.user_id = userId;
        this.balance = balance;
        this.nextPala = moment();
        this.nextPico = moment();
    }

    setBal(newBal) {
        this.balance = newBal;
    }
    addBal(bal) {
        this.balance += bal;
    }
    takeBal(bal) {
        this.balance -= bal;
    }

    canPala() {
        const now = moment();

        if (now.diff(moment(this.nextPala), 's') < 0) return false;

        this.nextPala = now.add(config.palaTimeout, 's');
        return true
    }

    canPico() {
        const now = moment();

        if (now.diff(moment(this.nextPico), 's') < 0) return false;

        this.nextPico = now.add(config.picoTimeout, 's');
        return true
    }
}

module.exports = WalletDAO;
const { Sequelize, DataTypes } = require("sequelize");

/**
 * @param {Sequelize} sequelize 
 * @returns 
 */
function run(sequelize) {
    const Wallet = sequelize.define("wallet", {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        balance: {
            type: DataTypes.NUMBER,
            allowNull: false
        }
    });

    return Wallet;
}

module.exports = run;
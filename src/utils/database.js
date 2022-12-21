const { Sequelize } = require("sequelize");
const idle = 30;
let lastSequelize = null;

class LastSequelize {
    /**
     * @param {Sequelize} seque 
     */
    constructor(seque) {
        this.seque = seque;
        this.timeout = idle;
        this.loop();
    }

    get() {
        this.timeout = idle;
        return this.seque;
    }

    loop() {
        this.interval = setInterval(() => {
            this.timeout--;
            if (this.timeout <= 0) {
                // console.log('[DATA] Conexion Cerrada.');
                this.seque.close();
                clearInterval(this.interval);
            }
        }, 1000);
    }
}

/**
 * @param {Boolean} auth En caso de querer autenticar la conexion 
 * (true)
 * @returns {Promise<Sequelize>}
 */
async function database(auth = true) {
    if (lastSequelize?.seque?.connectionManager?.pool?._count) { /*console.log('[DATA] Conexion Vieja.');*/ return lastSequelize.get(); };

    // console.log('[DATA] Conexion Nueva.');
    const sequelize = new Sequelize(
        process.env.BASENAME,
        process.env.BASEUSER,
        process.env.BASEPASS,
        {
            pool: { idle: idle * 1000 },
            host: process.env.BASEIP,
            dialect: 'mysql',
            logging: false,
            define: { timestamps: false, freezeTableName: true },
        },
    );
    if (auth) await sequelize.authenticate();
    lastSequelize = new LastSequelize(sequelize);
    return sequelize;
}

module.exports = database;
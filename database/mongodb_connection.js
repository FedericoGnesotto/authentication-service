const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/db.config');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        if (process.env.NODE_ENV === 'test') {
            mongod = await MongoMemoryServer.create();
            dbUrl = mongod.getUri();
        }

        mongoose
            .connect(MONGODB_URI)
            .then((conn) => {
                console.log(`Connected to ${conn.connection.host}`);
            })
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }
}

const disconnectDB = async () => {
    try {
        mongoose
            .disconnect()
            .then(() => { console.log("disconnected") })
            .catch((err) => {
                console.log(err);
                process.exit(1);
            })
        if (mongod) {
            await mongod.stop();
        }
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

}

module.exports = { connectDB, disconnectDB };
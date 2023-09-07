const path = require('path');

const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const openDB = () => {
    return open({
        filename: path.join(__dirname, 'data.db'),
        driver: sqlite3.Database,
    });
};

module.exports = openDB;

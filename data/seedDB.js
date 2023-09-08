const openDB = require('./openDB');

const seedDB = async () => {
    const db = await openDB();

    try {
        const createPostsTable = `
            CREATE TABLE IF NOT EXISTS posts
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                type TEXT NOT NULL,
                message TEXT,
                link TEXT,
                media TEXT,
                context TEXT NOT NULL,
                publisher TEXT NOT NULL,
                time TEXT,
                timestamp TIMESTAMP,
                priority INTEGER NOT NULL,
                status TEXT
            );
        `;

        db.exec(createPostsTable);
    } catch (err) {
        if (err) {
            db.close();
            return console.error('There was an error when trying to create the default posts table: ', err);
        }
    }

    try {
        const createTimesheetTable = `
            CREATE TABLE IF NOT EXISTS timesheet
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                day TEXT NOT NULL,
                time TEXT NOT NULL,
                time_formatted TEXT NOT NULL,
                priority INTEGER NOT NULL
            );
        `;

        db.exec(createTimesheetTable);
    } catch (err) {
        if (err) {
            db.close();
            return console.error('There was an error when trying to create the default timesheet table: ', err);
        }
    }

    db.close();
};

module.exports = seedDB;

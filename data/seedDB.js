const bcrypt = require('bcryptjs');

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

        await db.exec(createPostsTable);
    } catch (err) {
        if (err) {
            await db.close();
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

        await db.exec(createTimesheetTable);
    } catch (err) {
        if (err) {
            await db.close();
            return console.error('There was an error when trying to create the default timesheet table: ', err);
        }
    }

    try {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        `;

        await db.exec(createUsersTable);
    } catch (err) {
        if (err) {
            await db.close();
            return console.error('There was an error when trying to create the default users table: ', err);
        }
    }

    try {
        const existing = await db.get('SELECT * FROM Users');

        if (existing) return;

        const createAdminAccount = `
            INSERT INTO Users
            (
                username,
                password
            ) VALUES (?, ?);
        `;

        const username = 'admin';
        const password = bcrypt.hashSync('admin', 12);

        const params = [username, password];

        await db.run(createAdminAccount, params);
    } catch (err) {
        if (err) {
            await db.close();
            return console.error('There was an error when trying to create the default user(s): ', err);
        }
    }

    try {
        const createGroupsTable = `
            CREATE TABLE IF NOT EXISTS groups
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                link TEXT NOT NULL UNIQUE
            );
        `;

        await db.exec(createGroupsTable);
    } catch (err) {
        if (err) {
            await db.close();
            return console.error('There was an error when trying to create the default groups table: ', err);
        }
    }

    try {
        const createPostGroupsTable = `
            CREATE TABLE IF NOT EXISTS post_groups
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                group_id INTEGER NOT NULL
            );
        `;

        await db.exec(createPostGroupsTable);
    } catch (err) {
        if (err) {
            await db.close();
            return console.error('There was an error when trying to create the post_groups table: ', err);
        }
    }

    db.close();
};

module.exports = seedDB;

const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const openMG = () => {
    return open({
        filename: path.join(__dirname, 'old.db'),
        driver: sqlite3.Database,
    });
};

const openDB = require('./openDB');
const seedDB = require('./seedDB');

(async () => {
    // Seed the new database.
    await seedDB();

    const db = {
        old: await openMG(),
        new: await openDB(),
    };

    console.log('---------------');
    console.log('Starting the database migration!\n\n');

    // Migrate the old users to the new one.
    try {
        console.log('[1] Migrating the user details...');
        const users = await db.old.all('SELECT * FROM Users');
        if (users?.length > 0) {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];

                const query = `
                    INSERT INTO Users
                    (
                        username,
                        password
                    ) VALUES (?, ?);
                `;
                const params = [user.username, user.password];

                await db.new.run(query, params);
            }
        }
        console.log('[1] User Migration Completed!\n\n');
    } catch (err) {
        if (err) {
            console.error('[1] There was an error when exporting the user details: ', err);
        }
    }

    // Migrate the old timeslots to the new one
    try {
        console.log('[2] Migrating the timesheet...');
        const timeslots = await db.old.all('SELECT * FROM Timesheet');
        if (timeslots?.length > 0) {
            for (let i = 0; i < timeslots.length; i++) {
                const timeslot = timeslots[i];

                const query = `
                    INSERT INTO timesheet
                    (
                        day,
                        time,
                        time_formatted,
                        priority
                    ) VALUES (?, ?, ?, ?);
                `;
                const params = [timeslot.day, timeslot.time, timeslot.time_formatted, timeslot.priority];

                await db.new.run(query, params);
            }
        }
        console.log('[2] Timesheet Migration Completed!\n\n');
    } catch (err) {
        if (err) {
            console.error('[2] There was an error when exporting the timesheet: ', err);
        }
    }

    // Migrate the old posts to the new one
    try {
        console.log('[3] Migrating the posts...');
        const posts = await db.old.all('SELECT * FROM Posts');
        if (posts?.length > 0) {
            for (let i = 0; i < posts.length; i++) {
                const post = posts[i];

                const query = `
                    INSERT INTO Posts
                    (
                        type,
                        message,
                        link,
                        media,
                        groups,
                        context,
                        publisher,
                        time,
                        timestamp,
                        priority,
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;
                const params = [
                    post.type,
                    post.message,
                    post.link,
                    post.media,
                    post?.groups ? post.groups : '[]',
                    post.context,
                    post.publisher,
                    post.time,
                    post.timestamp,
                    post.priority,
                    post.status,
                ];

                await db.new.run(query, params);
            }
        }
        console.log('[3] Posts Migration Completed!\n\n');
    } catch (err) {
        if (err) {
            console.error('[3] There was an error when migrating the posts: ', err);
        }
    }

    console.log('Database migration finished successfully!');
    console.log('---------------');
})();

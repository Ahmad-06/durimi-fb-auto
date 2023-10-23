const { readFileSync, renameSync, writeFileSync } = require('node:fs');
const { execSync } = require('node:child_process');

const { sleep } = require('./utils/utils');

const db_migrate = require('./data/migrate');

(async () => {
    console.log('----------');
    console.log('Starting application upgrade...');
    console.log('----------');

    await sleep(1500);

    console.log('\n\n');
    console.log('----------');
    console.log('[1] Upgrading the source code...');
    console.log('----------');

    await sleep(1500);

    try {
        execSync('git pull origin main');
    } catch (err) {
        if (err) return console.error('There was an error when upgrading the source code: \n', error);
    }

    await sleep(1500);

    // console.log('\n\n');
    console.log('----------');
    console.log('[1] Upgraded the source code successfully...');
    console.log('----------');

    console.log('\n\n');
    console.log('----------');
    console.log('[2] Generating the stylesheets...');
    console.log('----------');

    await sleep(1500);

    try {
        const message = Buffer.from(execSync('npm run build:sass')).toString();
        console.log(message);
    } catch (err) {
        if (err) return console.error('There was an error when generating new stylesheets: \n', err);
    }

    await sleep(1500);

    console.log('----------');
    console.log('[2] Successfully generated stylesheets...');
    console.log('----------');

    console.log('\n\n');
    console.log('----------');
    console.log('[2] Starting Database Migration...');
    console.log('----------');

    const upgraded_db_schema = JSON.parse(readFileSync('./data/schema.json'));

    if (upgraded_db_schema.migrate !== true) {
        await sleep(1500);

        console.log('No Database Migration is required for this iteration!');

        console.log('----------');
        console.log('[2] Halted the Database Migration process...');
        console.log('----------');
    } else {
        console.log('\nMoving the current database to old.db...');
        renameSync('./data/data.db', './data/old.db');
        await sleep(1500);

        console.log('\nExecuting the migration...\n');
        await sleep(1500);

        await db_migrate();

        await sleep(1500);
        console.log('\nCleaning up the migration...\n');

        const datetime = `${new Date().getFullYear()}-${
            new Date().getMonth() < 10 ? '0' : ''
        }${new Date().getMonth()}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${
            new Date().getHours() < 10 ? '0' : ''
        }${new Date().getHours()}${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}${
            new Date().getSeconds() < 10 ? '0' : ''
        }${new Date().getSeconds()}`;
        renameSync('./data/old.db', `./data/backups/data-backup-${datetime}.db`);
        await sleep(1500);

        upgraded_db_schema.migrate = false;
        writeFileSync('./data/schema.json', `${JSON.stringify(upgraded_db_schema, null, 4)}\n`);
        console.log('Disabling the migration flag until the next update...\n');
        await sleep(1500);

        console.log('----------');
        console.log('[2] Database Migration Completed...');
        console.log('----------');
    }

    await sleep(1500);
    console.log('\n\n');
    console.log('----------');
    console.log('Completed application upgrade...');
    console.log('----------');
})();

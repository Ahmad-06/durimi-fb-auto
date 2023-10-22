const { execSync } = require('node:child_process');

const { sleep } = require('./utils/utils');

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
        execSync('git pull origin feat-upgrade-script');
    } catch (err) {
        if (err) return console.error('There was an error when upgrading the source code: \n', error);
    }

    await sleep(1500);

    // console.log('\n\n');
    console.log('----------');
    console.log('[1] Upgraded the source code successfully...');
    console.log('----------');
})();

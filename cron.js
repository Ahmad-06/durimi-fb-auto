const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const fetch = require('node-fetch');

// Fetch the endpoints from the remote repository every 30 minutes.
cron.schedule('*/30 * * * *', async () => {
    const metaEndpoint = 'https://airy-beaded-caravel.glitch.me/meta-business-suite.json';
    const resp = await fetch(metaEndpoint);
    if (resp.ok) {
        const data = await resp.json();

        if (data?.meta?.selector?.success) {
            const selectors = JSON.stringify(data);
            const selectorsPath = path.join(__dirname, 'data', 'meta-business-suite.json');
            const currentSelectors = JSON.parse(fs.readFileSync(selectorsPath));
            if (currentSelectors.updated !== data.updated) fs.writeFileSync(selectorsPath, selectors);
        }
    }
});

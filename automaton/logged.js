const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

module.exports = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser.newPage();

    try {
        const loginURL = 'https://www.facebook.com/login';

        await page.goto(loginURL);
        await sleep(5000);
        if ((await page.url()) !== loginURL) {
            await browser.close();
            return {
                success: true,
                error: null,
            };
        } else {
            await browser.close();
            return {
                success: false,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Checking if user is already logged in.',
                    message: "The user isn't logged in.",
                },
            };
        }
    } catch (err) {
        await browser.close();

        return {
            success: false,
            error: {
                code: 500,
                type: 'Internal server error.',
                moment: 'Checking if the user is already logged in.',
                message: err,
            },
        };
    }
};

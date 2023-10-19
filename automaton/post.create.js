const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const { sleep } = require('../utils/utils');

module.exports = async (post, auth) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser?.newPage();

    // Check if an XPath exists on the page.
    const XPathExists = async (XPath) => {
        try {
            await page?.waitForXPath(XPath, { timeout: 2500 });
            return true;
        } catch (err) {
            return false;
        }
    };

    // Accept a dialog if it pops-up.
    page?.on('dialog', async (dialog) => {
        await dialog?.accept();
    });

    // Open the Meta Composer.
    try {
        await page?.goto(auth.meta.composer);
        await page?.waitForNetworkIdle();
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Opening Meta Composer.',
                    error: err?.toString(),
                },
            };
        }
    }

    // Get all the Selectors and XPaths
    const { xpath, selector } = JSON.parse(
        fs?.readFileSync(path.join(__dirname, '..', 'data', 'meta-business-suite.json')),
    );

    let status = {
        data: {
            groups: [],
        },
        error: {},
    };

    // Select the groups if post has them.
    if (post?.groups?.length > 0) {
        try {
            // Check if the Group-Page dropdown exists, open it if it does.
            if (await XPathExists(xpath?.pageGroupDropdown)) {
                const [pageGroupDropdown] = await page?.$x(xpath?.pageGroupDropdown);
                await pageGroupDropdown?.click();
                await sleep(1000);

                // Check if the Group-Selector dropdown exists, open if it does.
                if (await XPathExists(xpath?.groupSelector)) {
                    const [groupSelector] = await page?.$x(xpath?.groupSelector);
                    await groupSelector?.click();
                    await sleep(1000);

                    // Check if the Group-Selector modal exists.
                    if (await XPathExists(xpath?.groupSelectorModal)) {
                        // Select the Groups if they exist.
                        for (let i = 0; i < post?.groups.length; i++) {
                            const group = post?.groups[i];
                            const groupXPath = xpath?.group.replace('Name of Group', group);
                            if (await XPathExists(groupXPath)) {
                                const [group] = await page?.$x(groupXPath);
                                await group.click();
                                await sleep(1000);
                            } else {
                                status.data.groups.push(group);
                                status.error = {
                                    code: 60004,
                                    type: 'Meta Business Suite Error.',
                                    moment: 'Selecting the Groups that were chosen.',
                                    error: 'The Groups did not show up in the Selection modal.',
                                };
                            }
                        }
                    } else {
                        status.data.groups = post?.groups;
                        status.error = {
                            code: 60003,
                            type: 'Meta Business Suite Error.',
                            moment: 'Opening Group-Selector modal.',
                            error: "The Group-Selector modal couldn't be found.",
                        };
                    }
                } else {
                    status.data.groups = post?.groups;
                    status.error = {
                        code: 60002,
                        type: 'Meta Business Suite Error.',
                        moment: 'Opening Group-Selector dropdown.',
                        error: "The Group-Selector dropdown couldn't be found.",
                    };
                }
            } else {
                status.data.groups = post?.groups;
                status.error = {
                    code: 60001,
                    type: 'Meta Business Suite Error.',
                    moment: 'Opening Group-Page dropdown.',
                    error: "The Group-Page dropdown couldn't be found.",
                };
            }
        } catch (err) {
            if (err) {
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 702,
                        type: 'Puppeteer error.',
                        moment: 'Selecting Groups.',
                        error: err?.toString(),
                    },
                };
            }
        }
    }

    // Type the post message if it exists.
    const message = post?.message;
    if (message !== null) {
        try {
            const dialog = selector?.dialogueBox;
            await page?.click(dialog);
            await sleep(1000);
            await page?.type(dialog, message, { delay: 25 });
            await sleep(1000);
        } catch (err) {
            if (err) {
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 703,
                        type: 'Puppeteer error.',
                        moment: 'Typing message.',
                        error: err?.toString(),
                    },
                };
            }
        }
    }

    // Connect the link to the post if it exists.
    const link = post?.link;
    if (link !== null) {
        try {
            await page?.click(selector?.linkPreview);
            await sleep(1000);

            await page?.click(selector?.linkInput);
            await sleep(1000);

            await page?.type(selector?.linkInput, link, { delay: 25 });
            await sleep(1000);

            if (await XPathExists(xpath?.saveLink)) {
                const [saveLink] = await page?.$x(xpath?.saveLink);
                await saveLink.click();
                await sleep(1000);
            }
        } catch (err) {
            if (err) {
                await browser?.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 704,
                        type: 'Puppeteer error.',
                        moment: 'Typing link.',
                        error: err?.toString(),
                    },
                };
            }
        }
    }

    // Publish the Post
    try {
        if (await XPathExists(xpath?.publishButton)) {
            const [publishButton] = await page?.$x(xpath?.publishButton);
            await publishButton.click();
        }
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 705,
                    type: 'Puppeteer error.',
                    moment: 'Publishing post.',
                    error: err?.toString(),
                },
            };
        }
    }

    // Return with Success
    await sleep(10000);
    await browser?.close();
    return {
        success: true,
        data: status.data.groups.length < 1 ? null : status.data,
        error: status?.error?.code ? status.error : null,
    };
};

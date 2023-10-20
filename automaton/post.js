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

    // Check if an XPath exists on the page?.
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

    // Open facebook and go to a dead link.
    try {
        const deadURL = 'https://www.facebook.com/tv/bv/cv/ev';

        await page?.goto(deadURL);

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Opening facebook.',
                    error: err.toString(),
                },
            };
        }
    }

    // Open user profile.
    try {
        const profileIcon = 'svg[aria-label="Your profile"]';

        await page?.waitForSelector(profileIcon);
        await page?.click(profileIcon);

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 702,
                    type: 'Puppeteer error.',
                    moment: 'Opening user profile.',
                    error: err.toString(),
                },
            };
        }
    }

    // Open the profile switcher.
    try {
        if (await XPathExists("//span[contains(., 'See all profiles')]")) {
            const [profileSwitcher] = await page?.$x("//span[contains(., 'See all profiles')]");

            await profileSwitcher.click();
        } else {
            const [profileSwitcher] = await page?.$x("//span[contains(., 'Switch')]");

            await profileSwitcher.click();
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 703,
                    type: 'Puppeteer error.',
                    moment: 'Opening the profile switcher.',
                    error: err.toString(),
                },
            };
        }
    }

    // Switch to the correct publisher.
    try {
        const [userSwitch] = await page?.$x(`//span[text()='${auth?.publisher?.user}']`);
        const [pageSwitch] = await page?.$x(`//span[text()='${auth?.publisher?.page}']`);

        if (post?.publisher === 'user' && post?.context !== 'page') {
            await userSwitch.evaluate((s) => s.click());
        } else {
            await pageSwitch.evaluate((s) => s.click());
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 704,
                    type: 'Puppeteer error.',
                    moment: 'Switching to the correct publisher.',
                    error: err.toString(),
                },
            };
        }
    }

    // Handle the cookie button.
    try {
        const cookieButton = 'div[aria-label="Allow essential and optional cookies"][role=button]';

        if (await page?.$(cookieButton)) {
            await page?.click(cookieButton);
            await sleep(3000);
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
                    moment: 'Handling the cookie button.',
                    error: err.toString(),
                },
            };
        }
    }

    // Handle the acceptance of selling your soul.
    try {
        const acceptButton = 'div[aria-label="I accept"][role=button][tabindex="0"]';

        if (await page?.$(acceptButton)) {
            await page?.click(acceptButton);
            await sleep(3000);
        }
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 706,
                    type: 'Puppeteer error.',
                    moment: 'Accepting the unwanted cookies.',
                    error: err.toString(),
                },
            };
        }
    }

    // Switch to the correct context.
    try {
        const contextURL = post?.context === 'page' ? auth?.context?.page : auth?.context?.group;

        await page?.goto(contextURL);

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 707,
                    type: 'Puppeteer error.',
                    moment: 'Switching to the context.',
                    error: err.toString(),
                },
            };
        }
    }

    // Open the post creation form.
    try {
        const context = post?.context;

        if (context === 'group') {
            const [groupWriter] = await page?.$x("//span[contains(., 'Write something...')]");
            await groupWriter.click();
        } else {
            const [pageWriter] = await page?.$x("//span[contains(., '" + 's on your mind?' + "')]");
            await pageWriter.click();
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 708,
                    type: 'Puppeteer error.',
                    moment: 'Opening the create post form.',
                    error: err.toString(),
                },
            };
        }
    }

    // Plug in the media files.
    if (post?.media?.length > 0 && post?.media !== null && post?.media !== '') {
        if (post?.context === 'group') {
            try {
                const fileUploadHandler = 'div[aria-label="Photo/video"][role=button]';
                const fileInputHandler = 'input[type=file][multiple]';
                let xyz = false;

                try {
                    await page?.waitForSelector(fileInputHandler, { timeout: 2500 });
                } catch (err) {
                    if (err) xyz = true;
                }

                console.log('XYZ is now: ', xyz);

                if (xyz) {
                    await page?.click(fileUploadHandler);
                    await page?.waitForSelector(fileInputHandler);
                    const fileInputSingle = await page?.$(fileInputHandler);

                    const mediaPath = path.join(__dirname, '..', 'public', 'media');

                    await fileInputSingle.uploadFile(path.join(mediaPath, post?.media[0]));

                    if (post?.media?.length > 1) {
                        await page?.waitForSelector(fileInputHandler);
                        const fileInputMulti = await page?.$(fileInputHandler);

                        for (let i = 0; i < post?.media?.length; i++) {
                            if (i !== 0) {
                                fileInputMulti.uploadFile(path.join(mediaPath, post?.media[i]));
                            }
                        }
                    }
                } else {
                    const fileInputHandler = 'input[type=file][multiple]';
                    await page?.waitForSelector(fileInputHandler);
                    const fileInput = await page?.$$(fileInputHandler);
                    const file = fileInput[1];

                    for (let i = 0; i < post?.media?.length; i++) {
                        const image = post?.media[i];
                        const imagePath = path.join(__dirname, '..', 'public', 'media', image);

                        await file.uploadFile(imagePath);
                    }
                }
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 709,
                            type: 'Puppeteer error.',
                            moment: 'Inserting the images attached to the post?.',
                            error: err.toString(),
                        },
                    };
                }
            }
        } else {
            try {
                const fileUploadHandler = 'div[aria-label="Photo/video"][role=button]';
                await page?.click(fileUploadHandler);

                const fileInputHandler = 'input[type=file][multiple]';
                await page?.waitForSelector(fileInputHandler);
                const fileInputSingle = await page?.$(fileInputHandler);

                const mediaPath = path.join(__dirname, '..', 'public', 'media');

                await fileInputSingle.uploadFile(path.join(mediaPath, post?.media[0]));

                if (post?.media?.length > 1) {
                    await page?.waitForSelector(fileInputHandler);
                    const fileInputMulti = await page?.$(fileInputHandler);

                    for (let i = 0; i < post?.media?.length; i++) {
                        if (i !== 0) {
                            fileInputMulti.uploadFile(path.join(mediaPath, post?.media[i]));
                        }
                    }
                }
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 710,
                            type: 'Puppeteer error.',
                            moment: 'Inserting the images attached to the post?.',
                            error: err.toString(),
                        },
                    };
                }
            }
        }
    }

    await sleep(3000);

    const pageField = 'div[aria-label="What\'s on your mind?"][contenteditable=true][role=textbox]';
    const groupField = 'div[aria-label="Create a public post…"][contenteditable=true][role=textbox]';

    // Switch to the content writing field.
    try {
        if (post?.context === 'group') {
            await page?.click(groupField);
        } else {
            await page?.click(pageField);
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 711,
                    type: 'Puppeteer error.',
                    moment: 'Switching to the content writing field.',
                    error: err.toString(),
                },
            };
        }
    }

    // Type in the content as needed.
    if (post?.media?.length === 0 || post?.media === null || post?.media === '') {
        const inputField = post?.context === 'group' ? groupField : pageField;

        if (post?.link !== '' && post?.link !== null) {
            for (let i = 1; i > 0; i++) {
                try {
                    await page?.type(inputField, post?.link, { delay: 25 });

                    await sleep(7000);

                    await page?.click(inputField, { clickCount: 3 });

                    await page?.keyboard.press('Backspace');

                    await sleep(1000);

                    try {
                        if (await page.waitForSelector('[aria-label="Creating link preview"]')) {
                            break;
                        }
                    } catch (err) {
                        if (err) continue;
                    }
                } catch (err) {
                    if (err) {
                        await browser?.close();

                        return {
                            success: false,
                            data: null,
                            error: {
                                code: 714,
                                type: 'Puppeteer error.',
                                moment: 'Typing in the post link.',
                                error: err.toString(),
                            },
                        };
                    }
                }
            }
        }

        if (post?.message !== '' && post?.message !== null) {
            try {
                await page?.type(inputField, post?.message, { delay: 25 });
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 715,
                            type: 'Puppeteer error.',
                            moment: 'Typing in the post message.',
                            error: err.toString(),
                        },
                    };
                }
            }
        }
    } else {
        const inputField = post?.context === 'group' ? groupField : pageField;

        if (post?.message !== '' && post?.message !== null) {
            try {
                await page?.type(inputField, post?.message, { delay: 25 });

                if (post?.link !== '' && post?.link !== null) {
                    await page?.keyboard.press('Enter');
                    await page?.keyboard.press('Enter');
                }
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 712,
                            type: 'Puppeteer error.',
                            moment: 'Typing down the post message.',
                            error: err.toString(),
                        },
                    };
                }
            }
        }

        if (post?.link !== '' && post?.link !== null) {
            try {
                await page?.type(inputField, post?.link, { delay: 25 });
            } catch (err) {
                if (err) {
                    await browser?.close();

                    return {
                        success: false,
                        data: null,
                        error: {
                            code: 713,
                            type: 'Puppeteer error.',
                            moment: 'Typing down the post link.',
                            error: err.toString(),
                        },
                    };
                }
            }
        }
    }

    await sleep(1000);

    // Click on the post it button.
    try {
        const postIt = 'div[aria-label=Post][role=button]';
        const postItUp = 'div[aria-label="Post on Facebook"][role=button]';

        if (await page?.$(postIt)) {
            await page?.click(postIt);
        } else {
            await page?.click(postItUp);
        }

        await sleep(3000);
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 716,
                    type: 'Puppeteer error.',
                    moment: 'Publishing the post to Facebook.',
                    error: err.toString(),
                },
            };
        }
    }

    // Watch for the hosting event pop-up.
    try {
        const eventHead = "//span[contains(., 'Hosting an event?')]";
        const noEvent = "//span[contains(., 'Not now')]";

        if (await page?.$x(eventHead)) {
            if (await page?.$x(noEvent)) {
                const [cancelEvent] = await page?.$x(noEvent);
                await cancelEvent?.click();
            }
        }
    } catch (err) {
        if (err) {
            await browser?.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 717,
                    type: 'Puppeteer error.',
                    moment: 'Handling the event hosting pop-up.',
                    error: err.toString(),
                },
            };
        }
    }

    const totalSleepTime = 15000 + post?.media?.length * 10000;

    await sleep(totalSleepTime);
    await browser?.close();
    return {
        success: true,
        data: null,
        error: null,
    };
};

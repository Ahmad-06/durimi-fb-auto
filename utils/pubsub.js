const pub = {
    post: require('../automaton/post'),
    meta: require('../automaton/post.create'),
};

const auth = {
    publisher: {
        page: process.env.PAGE_NAME,
        user: process.env.PROFILE_NAME,
    },
    context: {
        page: process.env.PAGE_LINK,
        group: process.env.GROUP_LINK,
    },
    meta: {
        composer: process.env.META_COMPOSER_LINK,
    },
};

module.exports = async (posts, db) => {
    if (posts.length > 0) {
        // Standardize the data.
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            post.message = post.message === null || post.message === 'null' ? null : post.message;
            post.link = post.link === null || post.link === 'null' ? null : post.link;
            post.media = post.media === null || post.media === 'null' ? null : JSON.parse(post.media);
            post.groups = post.groups === null || post.groups === 'null' ? null : JSON.parse(post.groups);

            // Get the group names instead of IDs.
            if (post?.groups !== null && post?.groups?.length > 0) {
                let groups = [];
                for (let i = 0; i < post.groups.length; i++) {
                    const id = post.groups[i];
                    const group = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
                    groups.push(group.name);
                }
                post.groups = groups;
            }

            if (post?.media === null || post?.media?.length < 1) {
                const res = await pub.meta(post, auth);

                if (!res.success)
                    console.error({
                        message: 'Failed to post to the page.',
                        adapatar: 'Meta',
                        post,
                        res,
                    });

                if (res?.success && res?.data?.groups !== null && res?.data?.groups?.length > 0) {
                    const groups = res?.data?.groups;

                    let j = 0;

                    for (let i = 0; i < groups?.length; i++) {
                        const name = groups[i];
                        const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                        auth.context.group = group.link;
                        post.context = 'group';

                        const res = await pub.post(post, auth);

                        if (!res.success) {
                            console.error({
                                message: 'Failed to post to the group.',
                                adaptor: 'Legacy',
                                post,
                                res,
                            });
                            j++;
                        }

                        if (i === groups?.length - 1 && j === 0) {
                            // Delete the post once everything is published.
                            try {
                                const query = `
                                        DELETE
                                            FROM
                                                posts
                                            WHERE
                                                id = ?;
                                    `;
                                const params = [post.id];

                                await db.run(query, params);

                                return {
                                    success: true,
                                    data: null,
                                    error: null,
                                };
                            } catch (err) {
                                if (err) {
                                    return {
                                        success: false,
                                        data: null,
                                        error: {
                                            code: 500,
                                            type: 'Internal server error.',
                                            moment: 'Deleting post from the database.',
                                            error: err.toString(),
                                        },
                                    };
                                }
                            }
                        } else {
                            if (res.success && i === groups?.length - 1 && j === 0) {
                                // Delete the post once everything is published.
                                try {
                                    const query = `
                                            DELETE
                                                FROM
                                                    posts
                                                WHERE
                                                    id = ?;
                                        `;
                                    const params = [post.id];

                                    await db.run(query, params);

                                    return {
                                        success: true,
                                        data: null,
                                        error: null,
                                    };
                                } catch (err) {
                                    if (err) {
                                        return {
                                            success: false,
                                            data: null,
                                            error: {
                                                code: 500,
                                                type: 'Internal server error.',
                                                moment: 'Deleting post from the database.',
                                                error: err.toString(),
                                            },
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                const res = await pub.post(post, auth);

                if (!res.success)
                    console.error({ message: 'Failed to post to the page.', adaptar: 'Legacy', post, res });

                if (post?.groups?.length > 0) {
                    const groups = post?.groups;

                    let j = 0;

                    for (let i = 0; i < groups?.length; i++) {
                        const name = groups[i];
                        const group = await db.get('SELECT * FROM groups WHERE name = ?', [name]);
                        auth.context.group = group.link;
                        post.context = 'group';

                        const res = await pub.post(post, auth);

                        if (!res.success) {
                            console.error({
                                message: 'Failed to post to the group.',
                                adaptar: 'Legacy',
                                post,
                                res,
                            });
                            j++;
                        }

                        if (i === groups?.length - 1 && j === 0) {
                            // Delete the post once everything is published.
                            try {
                                const query = `
                                        DELETE
                                            FROM
                                                posts
                                            WHERE
                                                id = ?;
                                    `;
                                const params = [post.id];

                                await db.run(query, params);

                                return {
                                    success: true,
                                    data: null,
                                    error: null,
                                };
                            } catch (err) {
                                if (err) {
                                    return {
                                        success: false,
                                        data: null,
                                        error: {
                                            code: 500,
                                            type: 'Internal server error.',
                                            moment: 'Deleting post from the database.',
                                            error: err.toString(),
                                        },
                                    };
                                }
                            }
                        }
                    }
                } else {
                    // Delete the post once everything is published.
                    if (res.success) {
                        try {
                            const query = `
                                    DELETE
                                        FROM
                                            posts
                                        WHERE
                                            id = ?;
                                `;
                            const params = [post.id];

                            await db.run(query, params);

                            return {
                                success: true,
                                data: null,
                                error: null,
                            };
                        } catch (err) {
                            if (err) {
                                return {
                                    success: false,
                                    data: null,
                                    error: {
                                        code: 500,
                                        type: 'Internal server error.',
                                        moment: 'Deleting post from the database.',
                                        error: err.toString(),
                                    },
                                };
                            }
                        }
                    }
                }
            }
        }
    }
};

const createPost = async (index, type) => {
    const apiType = index === '0' ? 'create' : 'update';
    const apiEndpoint = type === 'publish' ? api.posts.publish : api.posts[apiType];

    const post = {
        id: getInput('id', index).value,
        message: getInput('message', index).value,
        link: getInput('link', index).value,
        media: getInput('media', index).value,
        context: getInput('context', index).value,
        publisher: getInput('publisher', index).value,
        time: getInput('time', index).value,
        priority: getInput('priority', index).value,
        type,
    };

    const resp = await fetch(apiEndpoint, {
        method: apiType === 'update' ? 'PUT' : 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(post),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('Error encountered when trying to create the Post.', error);

    window.location.href = '/posts';
};

const getInput = (name, index) => {
    return document.querySelector(`[name="${name}"][data-form-id="${index}"]`);
};

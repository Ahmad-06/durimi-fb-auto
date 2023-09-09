let posts;

(async () => {
    const type = document.getElementById('posts').getAttribute('data-type');

    const apiEndpoint = api.posts.get[type];

    const resp = await fetch(apiEndpoint);
    const { success, data, error } = await resp.json();

    if (!success) return handleError('There was an error getting the posts from the database.', error);

    posts = data.posts;

    renderPosts(posts);
})();

const renderPosts = (posts) => {
    let articles = '';

    // prettier-ignore
    posts.forEach((post, index) => {
        const article = `
            <form class="form" data-form-id="${post.id}" onsubmit="event.preventDefault();">
                <!-- THE INDEX -->
                <p class="form-index">${index + 1}</p>

                <!-- THE HEADING -->
                <h3 class="form-heading" data-form-id="${post.id}">Re-Order Post</h3>

                <!-- THE ID -->
                <input type="number" name="id" class="form-input hidden" data-form-id="${post.id}" value="${post.id}" />

                <!-- THE MESSAGE -->
                <textarea name="message" class="form-textarea" data-form-id="${
                    post.id
                }" placeholder="What's on your mind?">${post.message}</textarea>

                <!-- THE LINK -->
                <input type="url" name="link" class="form-input" data-form-id="${
                    post.id
                }" placeholder="http(s)://(www.)example.org" value="${post.link}" />

                <!-- THE MEDIA -->
                <section class="form-media" data-form-id="${post.id}">
                    <!-- THE SECONDARY GALLERY -->
                    <div class="form-media-gallery secondary hidden" data-form-id="${post.id}">
                        <input type="text" name="images" class="form-input hidden" data-form-id="${
                            post.id
                        }" value="null" />
                    </div>
                </section>

                <!-- THE OPTIONS -->
                <section class="form-options" data-form-id="${post.id}">
                    <!-- THE CONTEXT -->
                    <select name="context" class="form-select" data-form-id="${post.id}">
                        <option value="page" ${post.context === 'page' ? 'selected' : ''}>Post to Page</option>
                        <option value="group" ${post.context === 'group' ? 'selected' : ''}>Post to Group</option>
                    </select>

                    <!-- THE PUBLISHER -->
                    <select name="publisher" class="form-select" data-form-id="${post.id}">
                        <option value="page" ${post.publisher === 'page' ? 'selected' : ''}>Post as Page</option>
                        <option value="user" ${post.publisher === 'user' ? 'selected' : ''}>Post as User</option>
                    </select>
                </section>

                <!-- THE TIME -->
                <input type="datetime-local" name="time" class="form-input" data-form-id="${post.id}" value="${post.time}" />

                <!-- THE BUTTONS -->
                <section class="reorder-buttons">
                    <button onclick="event.preventDefault(); moveOrderUp(${index})"><i class="fa-regular fa-square-caret-up"></i></button>
                    <button onclick="event.preventDefault(); moveOrderDown(${index})"><i class="fa-regular fa-square-caret-down"></i></button>
                </section>
            </form>
        `;

        articles += article;
    });

    document.getElementById('posts').innerHTML = articles;
};

const array_move = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
        let k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
};

const moveOrderUp = (t) => {
    if (t > 0) {
        const articles = array_move(posts, t, t - 1);
        renderPosts(articles);
    }
};

const moveOrderDown = (t) => {
    if (t < posts.length - 1) {
        const articles = array_move(posts, t, t + 1);
        renderPosts(articles);
    }
};

const reOrderPosts = async () => {
    const apiEndpoint = api.posts.reOrder;

    const resp = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ posts: posts }),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error changing the order of the posts!', error);

    window.location.href = '/posts';
};

const cancelReOrder = () => {
    window.location.href = '/posts';
};

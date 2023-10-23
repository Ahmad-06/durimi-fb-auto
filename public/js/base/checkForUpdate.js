(async () => {
    const apiEndpoint = api.misc.update;
    const resp = await fetch(apiEndpoint);
    const { success, data, error } = await resp.json();

    if (success) {
        const allCookies = document.cookie;
        const cookies = allCookies.split(';');
        if (!cookies.includes('checkUpdate=false')) {
            if (data.update) {
                const body = document.querySelector('body');
                const updateIndicator = document.getElementById('update-indicator');

                body.classList.add('update-indicator-visible');
                updateIndicator.classList.remove('hidden');
            }
        }
    } else {
        handleError('Server did not respond with the requested update data.', error);
    }
})();

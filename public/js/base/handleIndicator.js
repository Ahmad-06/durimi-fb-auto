(async () => {
    const resp = await fetch('/api/v1/misc/indicator');
    const { success, data, error } = await resp.json();

    if (success) {
        const indicator = document.getElementById('indicator');
        const indicatorLink = document.getElementById('indicator-link');

        indicator.innerText = data.indicator;
        indicatorLink.setAttribute('href', data.link);
    } else {
        handleError('Server did not respond with the requested indicator data!', error);
    }
})();

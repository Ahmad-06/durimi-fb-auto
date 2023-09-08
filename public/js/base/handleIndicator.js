(async () => {
    const resp = await fetch('/api/v1/misc/indicator');
    const data = await resp.json();

    if (data.success && data.data.indicator) {
        const indicator = document.getElementById('indicator');

        indicator.innerText = data.data.indicator;
    } else {
        handleError('Server did not respond with the requested indicator data!', data.error);
    }
})();

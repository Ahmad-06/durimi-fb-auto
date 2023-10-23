const silenceUpdateNotification = () => {
    const body = document.querySelector('body');
    const updateIndicator = document.getElementById('update-indicator');

    updateIndicator.classList.add('hidden');
    body.classList.remove('update-indicator-visible');

    const currentTime = new Date().getTime();
    const futureTime = new Date(currentTime + 1000 * 60 * 60 * 12).toUTCString();

    document.cookie = `checkUpdate=false; expires=${futureTime}; path=/`;
};

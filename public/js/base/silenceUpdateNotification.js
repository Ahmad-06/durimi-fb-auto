const silenceUpdateNotification = () => {
    const body = document.querySelector('body');
    const updateIndicator = document.getElementById('update-indicator');

    updateIndicator.classList.add('hidden');
    body.classList.remove('update-indicator-visible');
};

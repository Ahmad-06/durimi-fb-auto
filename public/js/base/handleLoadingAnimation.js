const loaderIcon = document.getElementById('loading-icon');
const loaderOverlay = document.getElementById('loading-overlay');

const showLoadingAnimation = () => {
    loaderIcon.classList.remove('hidden');
    loaderOverlay.classList.remove('hidden');
};

const hideLoadingAnimation = () => {
    loaderIcon.classList.add('hidden');
    loaderOverlay.classList.add('hidden');
};

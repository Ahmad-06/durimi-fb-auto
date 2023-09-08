const errorModal = document.getElementById('error-modal');
const errorOverlay = document.getElementById('error-overlay');
const errorHeading = document.getElementById('error-modal-heading');
const errorMessage = document.getElementById('error-modal-message');
const errorContent = document.getElementById('error-modal-content');

const handleError = (message, err) => {
    errorHeading.innerText = `!!! ERROR${err.code ? ` ${err.code}` : ''} !!!`;
    errorMessage.innerText = message;
    errorContent.innerText = JSON.stringify(err, null, 2);

    errorModal.classList.remove('hidden');
    errorOverlay.classList.remove('hidden');
};

const closeError = () => {
    errorHeading.innerText = '';
    errorMessage.innerText = '';
    errorContent.innerText = '';

    errorModal.classList.add('hidden');
    errorOverlay.classList.add('hidden');
};

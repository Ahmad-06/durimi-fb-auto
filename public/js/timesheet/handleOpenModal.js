const openModal = (id) => {
    const modal = document.getElementById(id);
    const overlay = document.getElementById('modal-overlay');

    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
};

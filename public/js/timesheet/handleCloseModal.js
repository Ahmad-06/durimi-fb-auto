const closeModal = (id) => {
    const modal = document.getElementById(id);
    const overlay = document.getElementById('modal-overlay');

    modal.classList.add('hidden');
    overlay.classList.add('hidden');
};

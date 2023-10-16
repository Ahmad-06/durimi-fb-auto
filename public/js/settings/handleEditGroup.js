const handleEditGroup = (id, name, link) => {
    const idInput = document.getElementById('modal-update-id');
    const nameInput = document.getElementById('modal-update-name');
    const linkInput = document.getElementById('modal-update-link');

    idInput.value = id;
    nameInput.value = name;
    linkInput.value = link;

    openModal('modal-update');
};

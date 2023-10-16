const handleDeleteGroup = (id, name, link) => {
    const idInput = document.getElementById('modal-delete-id');
    const nameInput = document.getElementById('modal-delete-name');
    const linkInput = document.getElementById('modal-delete-link');

    idInput.value = id;
    nameInput.value = name;
    linkInput.value = link;

    openModal('modal-delete');
};

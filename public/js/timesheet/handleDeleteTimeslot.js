const handleDeleteTimeslot = (id, day, time) => {
    const heading = document.getElementById('modal-delete-heading');

    const idInput = document.getElementById('modal-delete-id');
    const dayInput = document.getElementById('modal-delete-day');
    const timeInput = document.getElementById('modal-delete-time');

    heading.innerText = day;

    idInput.value = id;
    dayInput.value = day;
    timeInput.value = time;

    openModal('modal-delete');
};

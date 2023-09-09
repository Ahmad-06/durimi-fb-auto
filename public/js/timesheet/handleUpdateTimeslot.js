const handleUpdateTimeslot = (id, day, time) => {
    const heading = document.getElementById('modal-update-heading');

    const idInput = document.getElementById('modal-update-id');
    const dayInput = document.getElementById('modal-update-day');
    const timeInput = document.getElementById('modal-update-time');

    heading.innerText = day;

    idInput.value = id;
    dayInput.value = day;
    timeInput.value = time;

    openModal('modal-update');
};

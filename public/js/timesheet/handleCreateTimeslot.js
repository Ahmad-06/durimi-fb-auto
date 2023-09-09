const handleCreateTimeslot = (day) => {
    const heading = document.getElementById('modal-create-heading');
    const dayInput = document.getElementById('modal-create-day');

    heading.innerText = day;
    dayInput.value = day;

    openModal('modal-create');
};

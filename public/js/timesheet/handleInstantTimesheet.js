(() => {
    const selectAllDays = document.getElementById('modal-instant-days-all');

    selectAllDays.addEventListener('change', (e) => {
        const days = document.querySelectorAll('.modal-instant-checkbox');
        if (e.currentTarget.checked) {
            days.forEach((day) => {
                if (day.id !== 'modal-instant-days-all') {
                    day.checked = false;
                    day.disabled = true;
                }
            });
        } else {
            days.forEach((day) => {
                day.disabled = false;
            });
        }
    });
})();

const createInstantTimeslots = async () => {
    const apiEndpoint = api.timesheet.instant;

    const allDays = document.getElementById('modal-instant-days-all');
    let checkedDays = [];

    if (allDays.checked) {
        checkedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else {
        const daysChecked = document.querySelectorAll('.modal-instant-checkbox:checked');

        for (let i = 0; i < daysChecked.length; i++) {
            const dayChecked = daysChecked[i];

            checkedDays.push(dayChecked.value);
        }
    }

    const time = document.getElementById('modal-instant-time').value;

    const timesheet = { days: checkedDays, time };

    const resp = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(timesheet),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when creating the timeslots in the database.', error);

    if (success && error) return handleError('There was an error when creating the timeslots in the database.', error);

    window.location.href = '/timesheet';
};

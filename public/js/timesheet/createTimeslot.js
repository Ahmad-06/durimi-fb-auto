const createTimeslot = async (route) => {
    const apiEndpoint = route === 'create' ? api.timesheet.create : api.timesheet.update;

    const idInput = document.getElementById('modal-update-id');
    const dayInput = document.getElementById(`modal-${route}-day`);
    const timeInput = document.getElementById(`modal-${route}-time`);

    const timeslot = {
        id: idInput.value,
        day: dayInput.value,
        time: timeInput.value,
    };

    const resp = await fetch(apiEndpoint, {
        method: route === 'create' ? 'POST' : 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(timeslot),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when publishing the timeslot to the database.', error);

    window.location.href = '/timesheet';
};

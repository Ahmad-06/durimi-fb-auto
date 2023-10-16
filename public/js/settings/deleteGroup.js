const deleteGroup = async () => {
    const apiEndpoint = api.groups.delete;

    const idInput = document.getElementById('modal-delete-id');

    const group = { id: idInput.value };

    const resp = await fetch(apiEndpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(group),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when deleting the timeslot from the database.', error);

    window.location.href = '/settings';
};

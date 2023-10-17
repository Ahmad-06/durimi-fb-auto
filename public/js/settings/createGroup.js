const createGroup = async (route) => {
    const apiEndpoint = route === 'create' ? api.groups.create : api.groups.update;

    const idInput = document.getElementById('modal-update-id');
    const nameInput = document.getElementById(`modal-${route}-name`);
    const linkInput = document.getElementById(`modal-${route}-link`);

    const group = {
        id: idInput.value,
        name: nameInput.value,
        link: linkInput.value,
    };

    const resp = await fetch(apiEndpoint, {
        method: route === 'create' ? 'POST' : 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(group),
    });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when publishing the timeslot to the database.', error);

    window.location.href = '/settings';
};

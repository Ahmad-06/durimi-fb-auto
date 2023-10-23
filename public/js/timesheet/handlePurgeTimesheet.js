const purgeTimesheet = async () => {
    const apiEndpoint = `${api.timesheet.delete}/all`;

    const resp = await fetch(apiEndpoint, { method: 'DELETE' });
    const { success, error } = await resp.json();

    if (!success) return handleError('There was an error when purging the timesheet from the database.', error);

    window.location.href = '/timesheet';
};

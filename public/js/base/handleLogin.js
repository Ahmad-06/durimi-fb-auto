const handleLogin = async () => {
    const apiEndpoint = api.misc.login;

    showLoadingAnimation();

    const resp = await fetch(apiEndpoint);
    const { success, error } = await resp.json();

    if (!success) {
        hideLoadingAnimation();
        handleError('There was an error when trying to log in.', error);
    }

    window.location.href = '/';
};

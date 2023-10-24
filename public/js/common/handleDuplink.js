const duplink = async (index, type) => {
    const apiEndpoint = api.misc.duplink;

    const link = getInput('link', index).value;

    if (!link) {
        return createPost(index, type);
    } else {
        const resp = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ link }),
        });
        const { success, error } = await resp.json();

        if (error) return handleError('Error encountered when checking for link duplication.', error);

        if (success) {
            return createPost(index, type);
        } else {
            const duplinkOverlay = document.getElementById('duplink-overlay');
            const duplinkModal = document.getElementById('duplink-modal');

            const duplinkIndex = document.getElementById('duplink-modal-index');
            const duplinkType = document.getElementById('duplink-modal-type');

            duplinkIndex.value = index;
            duplinkType.value = type;

            duplinkOverlay.classList.remove('hidden');
            duplinkModal.classList.remove('hidden');
        }
    }
};

const closeDuplinkWarning = () => {
    const duplinkOverlay = document.getElementById('duplink-overlay');
    const duplinkModal = document.getElementById('duplink-modal');

    const duplinkIndex = document.getElementById('duplink-modal-index');
    const duplinkType = document.getElementById('duplink-modal-type');

    duplinkIndex.value = '';
    duplinkType.value = '';

    duplinkOverlay.classList.add('hidden');
    duplinkModal.classList.add('hidden');
};

const ignoreDuplinkWarning = () => {
    const duplinkOverlay = document.getElementById('duplink-overlay');
    const duplinkModal = document.getElementById('duplink-modal');

    const duplinkIndex = document.getElementById('duplink-modal-index');
    const duplinkType = document.getElementById('duplink-modal-type');

    const index = duplinkIndex.value;
    const type = duplinkType.value;

    duplinkOverlay.classList.add('hidden');
    duplinkModal.classList.add('hidden');

    return createPost(index, type);
};

(() => {
    const groupsHolders = document.querySelectorAll('input[name="groups-holder"]');

    groupsHolders.forEach((groupsHolder) => {
        const id = groupsHolder.getAttribute('data-form-id');
        const groups =
            groupsHolder.value && (groupsHolder.value !== null || groupsHolder.value !== 'null' || groupsHolder !== '')
                ? JSON.parse(groupsHolder.value)
                : [];

        groups.forEach((group) => {
            const checkbox = document.querySelector(
                `#group-${group.id}-post-${id}[type="checkbox"][data-form-id="${id}"]`,
            );

            checkbox.checked = true;
        });
    });
})();

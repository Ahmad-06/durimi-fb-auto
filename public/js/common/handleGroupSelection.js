const toggleGroupSelector = (id) => {
    const groupSelector = document.querySelector(`.form-groups[data-form-id="${id}"]`);
    const groupSelectorIcon = document.querySelector(`.group-toggle-icon[data-form-id="${id}"]`);

    groupSelector.classList.toggle('hidden');
    groupSelectorIcon.classList.toggle('fa-chevron-down');
    groupSelectorIcon.classList.toggle('fa-chevron-up');
};

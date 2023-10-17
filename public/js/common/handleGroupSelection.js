const toggleGroupSelector = () => {
    const groupSelector = document.querySelector('.form-groups');
    const groupSelectorIcon = document.querySelector('.group-toggle-icon');

    groupSelector.classList.toggle('hidden');
    groupSelectorIcon.classList.toggle('fa-chevron-down');
    groupSelectorIcon.classList.toggle('fa-chevron-up');
};

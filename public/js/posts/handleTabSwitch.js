const handleTabSwitch = (id) => {
    const tabs = document.querySelectorAll('.tab');
    const switches = document.querySelectorAll('.tab-switch');

    tabs.forEach((TAB) => {
        TAB.classList.add('hidden');
        if (TAB.getAttribute('data-tab') === id) TAB.classList.remove('hidden');
    });

    switches.forEach((SWITCH) => {
        SWITCH.classList.remove('active');
        if (SWITCH.getAttribute('data-tab') === id) SWITCH.classList.add('active');
    });
};

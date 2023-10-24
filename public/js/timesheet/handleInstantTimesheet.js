(() => {
    const selectAllDays = document.getElementById('modal-instant-days-all');

    selectAllDays.addEventListener('change', (e) => {
        const days = document.querySelectorAll('.modal-instant-checkbox');
        if (e.currentTarget.checked) {
            days.forEach((day) => {
                if (day.id !== 'modal-instant-days-all') {
                    day.checked = false;
                    day.disabled = true;
                }
            });
        } else {
            days.forEach((day) => {
                day.disabled = false;
            });
        }
    });
})();

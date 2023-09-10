(async () => {
    const apiEndpoint = api.timesheet.get.all;

    const resp = await fetch(apiEndpoint);
    const { success, data, error } = await resp.json();

    const days = {
        Monday: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        Tuesday: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'],
        Wednesday: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday'],
        Thursday: ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        Friday: ['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        Saturday: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        Sunday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    };

    const day = days.Sunday[new Date().getDay()];
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const MINUTES = `${minutes < 10 ? '0' : ''}${minutes}`;
    const time = parseInt(`${hours}${MINUTES}`);

    let timeslots = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
    };

    for (let i = 0; i < data.timeslots.length; i++) {
        const timeslot = data.timeslots[i];

        timeslots[timeslot.day].push(timeslot);
    }

    const publishTimes = document.querySelectorAll('.publish-time');

    let arrayOfTimeslots = [];

    let m = 1;

    for (let i = 0; i < 7; i++) {
        const the_day = days[day][i];
        for (let j = 0; j < timeslots[the_day].length; j++) {
            const the_timeslot = timeslots[the_day][j];

            arrayOfTimeslots.push(the_timeslot);
            m = m + 1;
        }
    }

    let finalTimeslots = [];

    let firstWeek = [];

    for (let i = 0; i < arrayOfTimeslots.length; i++) {
        const final_day = arrayOfTimeslots[i].day;
        const final_time = arrayOfTimeslots[i].priority;
        const hours = new Date().getHours();
        const minutes = new Date().getMinutes();
        const MINUTES = `${minutes < 10 ? '0' : ''}${minutes}`;
        const current_time = parseInt(`${hours}${MINUTES}`);

        if (final_day === day) {
            if (!(current_time > final_time)) {
                firstWeek.push(arrayOfTimeslots[i]);
            }
        } else {
            firstWeek.push(arrayOfTimeslots[i]);
        }
    }

    finalTimeslots.push(firstWeek);

    const totalRepeats = parseInt(publishTimes.length / arrayOfTimeslots.length);

    for (let i = 0; i < totalRepeats + 2; i++) {
        finalTimeslots.push(arrayOfTimeslots);
    }

    let lol = 1;

    for (let i = 0; i < finalTimeslots.length; i++) {
        for (j = 0; j < finalTimeslots[i].length; j++) {
            if (lol <= publishTimes.length) {
                const id = lol;
                const publish_time = document.querySelector(`.publish-time-time[data-publish-id="${id}"]`);
                const publish_day = document.querySelector(`.publish-time-day[data-publish-id="${id}"]`);

                const timeslot = finalTimeslots[i][j];

                publish_time.innerText = timeslot.time_formatted;
                publish_day.innerText = timeslot.day;

                lol = lol + 1;
            }
        }
    }

    const date_today = getDate();
    const timestamp_today = new Date(date_today).getTime();

    let the_dates = [];

    let kamas = 0;

    for (let i = 0; i < totalRepeats + 3; i++) {
        const the_days = days[day];

        let da_dates = [];
        for (let j = 0; j < the_days.length; j++) {
            const more_time = kamas * 86400000;
            const timestamp = timestamp_today + more_time;
            kamas = kamas + 1;
            const date = getDate(timestamp);
            da_dates.push({ day: the_days[j], date: date });
        }
        the_dates.push(da_dates);
    }

    let finTis = [];

    for (let i = 0; i < the_dates.length; i++) {
        for (let j = 0; j < finalTimeslots[i].length; j++) {
            for (let k = 0; k < the_dates[i].length; k++) {
                if (finalTimeslots[i][j].day === the_dates[i][k].day) {
                    finTis.push([finalTimeslots[i][j].day, the_dates[i][k].date]);
                }
            }
        }
    }

    console.log();

    for (let i = 0; i < publishTimes.length; i++) {
        const publish_date = document.querySelector(`.publish-time-date[data-publish-id="${i + 1}"]`);

        publish_date.innerText = finTis[i][1];
    }
})();

const getDate = (timestamp = null) => {
    const year = timestamp ? new Date(timestamp).getFullYear() : new Date().getFullYear();
    let month = timestamp ? new Date(timestamp).getMonth() : new Date().getMonth();
    month = month + 1;
    const day = timestamp ? new Date(timestamp).getDate() : new Date().getDate();

    const MONTH = `${month < 10 ? '0' : ''}${month}`;
    const DAY = `${day < 10 ? '0' : ''}${day}`;

    const DATE = `${year}-${MONTH}-${DAY}`;

    return DATE;
};

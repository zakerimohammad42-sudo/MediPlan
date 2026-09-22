const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند"
];

const weekDays = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه"
];

const subjects = [
    { name: "قلب و عروق", color: "#ef4444" },
    { name: "نورولوژی", color: "#8b5cf6" },
    { name: "فارماکولوژی", color: "#22c55e" },
    { name: "پاتولوژی", color: "#f59e0b" },
    { name: "اطفال", color: "#06b6d4" },
    { name: "زنان", color: "#ec4899" },
    { name: "جراحی", color: "#f97316" },
    { name: "ریه", color: "#14b8a6" },
    { name: "کلیه", color: "#3b82f6" },
    { name: "گوارش", color: "#84cc16" },
    { name: "روماتولوژی", color: "#a855f7" },
    { name: "خون", color: "#dc2626" },
    { name: "غدد", color: "#eab308" },
    { name: "بیمارستان", color: "#64748b" },
    { name: "سایر", color: "#94a3b8" }
];


let currentYear = 1405;
let currentMonth = 6;

let selectedDay = null;

let studyPlans = JSON.parse(
    localStorage.getItem("mediplan_study_plans") || "{}"
);

let cases = JSON.parse(
    localStorage.getItem("mediplan_cases") || "[]"
);

let settings = JSON.parse(
    localStorage.getItem("mediplan_settings") ||
    '{"schedule24":true,"overlapWarning":true}'
);


/* =========================
   ابزارهای عددی
   ========================= */

function toPersianNumber(number) {

    return String(number)
        .replace(/0/g, "۰")
        .replace(/1/g, "۱")
        .replace(/2/g, "۲")
        .replace(/3/g, "۳")
        .replace(/4/g, "۴")
        .replace(/5/g, "۵")
        .replace(/6/g, "۶")
        .replace(/7/g, "۷")
        .replace(/8/g, "۸")
        .replace(/9/g, "۹");
}


/* =========================
   تبدیل میلادی به شمسی
   ========================= */

function gregorianToJalali(gy, gm, gd) {

    const gDaysInMonth = [
        31, 28, 31, 30, 31, 30,
        31, 31, 30, 31, 30, 31
    ];

    const jDaysInMonth = [
        31, 31, 31, 31, 31, 31,
        30, 30, 30, 30, 30, 30
    ];

    let gy2 = gy - 1600;
    let gm2 = gm - 1;
    let gd2 = gd - 1;

    let gDayNo =
        365 * gy2 +
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400);

    for (let i = 0; i < gm2; i++) {
        gDayNo += gDaysInMonth[i];
    }

    if (
        gm2 > 1 &&
        gy % 4 === 0 &&
        (gy % 100 !== 0 || gy % 400 === 0)
    ) {
        gDayNo++;
    }

    gDayNo += gd2;

    let jDayNo = gDayNo - 79;

    const jNp = Math.floor(jDayNo / 12053);

    jDayNo %= 12053;

    let jy =
        979 +
        33 * jNp +
        4 * Math.floor(jDayNo / 1461);

    jDayNo %= 1461;

    if (jDayNo >= 366) {

        jy += Math.floor((jDayNo - 1) / 365);

        jDayNo =
            (jDayNo - 1) % 365;
    }

    let jm = 0;

    while (
        jm < 11 &&
        jDayNo >= jDaysInMonth[jm]
    ) {
        jDayNo -= jDaysInMonth[jm];
        jm++;
    }

    return [
        jy,
        jm + 1,
        jDayNo + 1
    ];
}


/* =========================
   تعداد روزهای ماه شمسی
   ========================= */

function getDaysInJalaliMonth(year, month) {

    if (month <= 6) {
        return 31;
    }

    if (month <= 11) {
        return 30;
    }

    return isJalaliLeapYear(year) ? 30 : 29;
}


/* =========================
   سال کبیسه
   ========================= */

function isJalaliLeapYear(year) {

    const breaks = [
        -61, 9, 38, 199, 426,
        686, 756, 818, 1111,
        1181, 1210, 1635,
        2060, 2097, 2192,
        2262, 2324, 2394,
        2456, 3178
    ];

    let leapJ = -14;
    let jp = breaks[0];
    let jump = 0;

    for (let i = 1; i < breaks.length; i++) {

        const jm = breaks[i];

        jump = jm - jp;

        if (year < jm) {
            break;
        }

        leapJ +=
            Math.floor(jump / 33) * 8 +
            Math.floor((jump % 33) / 4);

        jp = jm;
    }

    let n = year - jp;

    leapJ +=
        Math.floor(n / 33) * 8 +
        Math.floor(((n % 33) + 3) / 4);

    if (
        jump % 33 === 4 &&
        jump - n === 4
    ) {
        leapJ++;
    }

    const gy = year + 621;

    const leapG =
        Math.floor(gy / 4) -
        Math.floor(
            (Math.floor(gy / 100) + 1) * 3 / 4
        ) -
        150;

    const march = 20 + leapJ - leapG;

    let n2;

    if (jump - n < 6) {
        n2 =
            n -
            jump +
            Math.floor((jump + 4) / 33) * 33;
    } else {
        n2 = n;
    }

    const leap =
        ((n2 + 1) % 33 - 1) % 4;

    return leap === 0 || leap === -1;
}


/* =========================
   روز اول ماه
   ========================= */

function getFirstDayOfMonth(year, month) {

    let date = new Date(
        year + 621,
        month - 1,
        1
    );

    for (let i = 0; i < 400; i++) {

        const converted =
            gregorianToJalali(
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate()
            );

        if (
            converted[0] === year &&
            converted[1] === month &&
            converted[2] === 1
        ) {
            break;
        }

        date = new Date(
            date.getTime() + 86400000
        );
    }

    return (date.getDay() + 1) % 7;
}


/* =========================
   کلید روز
   ========================= */

function getDayKey(year, month, day) {

    return `${year}-${month}-${day}`;
}


/* =========================
   برنامه‌های روز
   ========================= */

function getDayPlans(day) {

    const key =
        getDayKey(
            currentYear,
            currentMonth,
            day
        );

    return studyPlans[key] || [];
}


/* =========================
   تبدیل ساعت به دقیقه
   ========================= */

function timeToMinutes(time) {

    const parts = time.split(":");

    return (
        Number(parts[0]) * 60 +
        Number(parts[1])
    );
}


/* =========================
   محاسبه مدت
   ========================= */

function calculateDuration(start, end) {

    return (
        timeToMinutes(end) -
        timeToMinutes(start)
    );
}


/* =========================
   نمایش مدت
   ========================= */

function formatDuration(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    if (hours === 0) {
        return `${toPersianNumber(mins)} دقیقه`;
    }

    if (mins === 0) {
        return `${toPersianNumber(hours)} ساعت`;
    }

    return `${toPersianNumber(hours)} ساعت و ${toPersianNumber(mins)} دقیقه`;
}


/* =========================
   ذخیره اطلاعات
   ========================= */

function saveData() {

    localStorage.setItem(
        "mediplan_study_plans",
        JSON.stringify(studyPlans)
    );

    localStorage.setItem(
        "mediplan_cases",
        JSON.stringify(cases)
    );

    localStorage.setItem(
        "mediplan_settings",
        JSON.stringify(settings)
    );
}


/* =========================
   ساخت گزینه‌های ساعت
   ========================= */

function createTimeOptions() {

    let html = "";

    for (let hour = 0; hour < 24; hour++) {

        for (let minute of [0, 30]) {

            const value =
                `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

            html += `
                <option value="${value}">
                    ${value}
                </option>
            `;
        }
    }

    return html;
}


/* =========================
   تقویم
   ========================= */

function renderCalendar() {

    const calendars =
        document.querySelectorAll(
            ".calendar-placeholder"
        );

    if (!calendars.length) {
        return;
    }

    const daysInMonth =
        getDaysInJalaliMonth(
            currentYear,
            currentMonth
        );

    const firstDay =
        getFirstDayOfMonth(
            currentYear,
            currentMonth
        );


    let html = `

        <div class="calendar-top">

            <button
                id="prevMonth"
                type="button"
            >
                ‹
            </button>

            <h3>
                ${monthNames[currentMonth - 1]}
                ${toPersianNumber(currentYear)}
            </h3>

            <button
                id="nextMonth"
                type="button"
            >
                ›
            </button>

        </div>


        <div class="calendar-weekdays">
    `;


    weekDays.forEach(day => {

        html += `
            <div class="calendar-weekday">
                ${day}
            </div>
        `;

    });


    html += `
        </div>

        <div class="calendar-days">
    `;


    for (let i = 0; i < firstDay; i++) {

        html += `
            <div class="calendar-day empty"></div>
        `;

    }


    for (let day = 1; day <= daysInMonth; day++) {

        const plans =
            getDayPlans(day)
                .slice()
                .sort(
                    (a, b) =>
                        timeToMinutes(a.start) -
                        timeToMinutes(b.start)
                );


        let plansHTML = "";


        plans.slice(0, 3).forEach(plan => {

            plansHTML += `

                <div
                    class="day-plan ${plan.studied ? "completed-plan" : ""}"
                    style="
                        border-right-color:${plan.color};
                    "
                    title="${plan.studied ? "مطالعه شده" : "مطالعه نشده"}"
                >

                    ${plan.start}
                    -
                    ${plan.end}

                    ${plan.subject}

                    ${plan.studied ? " ✓" : ""}

                </div>
            `;

        });


        if (plans.length > 3) {

            plansHTML += `
                <div class="more-plans">
                    +${plans.length - 3} برنامه دیگر
                </div>
            `;

        }


        html += `

            <div
                class="calendar-day"
                data-day="${day}"
            >

                <span class="calendar-day-number">
                    ${toPersianNumber(day)}
                </span>

                <div class="day-plans">
                    ${plansHTML}
                </div>

                <button
                    class="day-add"
                    data-day="${day}"
                    type="button"
                >
                    +
                </button>

            </div>
        `;

    }


    html += `
        </div>
    `;


    calendars.forEach(calendar => {

        calendar.innerHTML = html;

    });


    document.querySelectorAll("#prevMonth")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentMonth--;

                    if (currentMonth < 1) {

                        currentMonth = 12;
                        currentYear--;

                    }

                    renderCalendar();
                    updateDashboard();

                }
            );

        });


    document.querySelectorAll("#nextMonth")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentMonth++;

                    if (currentMonth > 12) {

                        currentMonth = 1;
                        currentYear++;

                    }

                    renderCalendar();
                    updateDashboard();

                }
            );

        });


    document
        .querySelectorAll(".calendar-day[data-day]")
        .forEach(dayElement => {

            dayElement.addEventListener(
                "click",
                event => {

                    if (
                        event.target.classList.contains(
                            "day-add"
                        )
                    ) {
                        return;
                    }

                    const day =
                        Number(
                            dayElement.dataset.day
                        );

                    renderDaySchedule(day);

                }
            );

        });


    document
        .querySelectorAll(".day-add")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const day =
                        Number(
                            button.dataset.day
                        );

                    openStudyPanel(day);

                }
            );

        });
}


/* =========================
   برنامه ۲۴ ساعته
   ========================= */

function renderDaySchedule(day) {

    const calendars =
        document.querySelectorAll(
            ".calendar-placeholder"
        );

    if (!calendars.length) {
        return;
    }


    const plans =
        getDayPlans(day)
            .slice()
            .sort(
                (a, b) =>
                    timeToMinutes(a.start) -
                    timeToMinutes(b.start)
            );


    let rowsHTML = "";


    for (let hour = 0; hour < 24; hour++) {

        const hourStart =
            hour * 60;

        const hourEnd =
            hourStart + 60;


        const hourPlans =
            plans.filter(plan => {

                const start =
                    timeToMinutes(plan.start);

                const end =
                    timeToMinutes(plan.end);

                return (
                    start < hourEnd &&
                    end > hourStart
                );

            });


        let planHTML = "";


        hourPlans.forEach(plan => {

            planHTML += `

                <div
                    class="schedule-plan ${plan.studied ? "completed-plan" : ""}"
                    style="
                        border-right-color:${plan.color};
                    "
                >

                    <div class="schedule-plan-info">

                        <span class="schedule-plan-time">
                            ${plan.start} - ${plan.end}
                        </span>

                        <span class="schedule-plan-subject">
                            ${plan.subject}
                        </span>

                        <span class="schedule-plan-duration">
                            ${formatDuration(plan.duration)}
                        </span>

                        <button
                            class="complete-plan-button"
                            data-plan-id="${plan.id}"
                            type="button"
                        >
                            ${plan.studied ? "✓ مطالعه شد" : "ثبت مطالعه"}
                        </button>

                        <button
                            class="delete-plan-button"
                            data-plan-id="${plan.id}"
                            type="button"
                        >
                            حذف
                        </button>

                    </div>

                </div>

            `;

        });


        rowsHTML += `

            <div class="schedule-row">

                <div class="schedule-time">
                    ${String(hour).padStart(2, "0")}:00
                </div>

                <div class="schedule-slot">

                    ${
                        planHTML ||
                        '<div class="schedule-empty"></div>'
                    }

                </div>

            </div>

        `;

    }


    const legendSubjects = [];

    plans.forEach(plan => {

        if (
            !legendSubjects.some(
                item =>
                    item.name === plan.subject
            )
        ) {

            legendSubjects.push({
                name: plan.subject,
                color: plan.color
            });

        }

    });


    let legendHTML = "";


    legendSubjects.forEach(subject => {

        legendHTML += `

            <div class="schedule-legend-item">

                <span
                    class="schedule-legend-color"
                    style="
                        background:${subject.color};
                    "
                ></span>

                ${subject.name}

            </div>
        `;

    });


    const html = `

        <div class="day-schedule-view">

            <div class="schedule-header">

                <div class="schedule-title">

                    <span>📅</span>

                    <div>

                        <h3>
                            برنامه روز ${toPersianNumber(day)}
                        </h3>

                        <p>
                            ${monthNames[currentMonth - 1]}
                            ${toPersianNumber(currentYear)}
                        </p>

                    </div>

                </div>


                <button
                    class="schedule-back-button"
                    id="backToCalendar"
                    type="button"
                >
                    ← تقویم ماهانه
                </button>

            </div>


            <div class="schedule-table">

                ${rowsHTML}

            </div>


            ${
                legendHTML
                    ? `
                        <div class="schedule-legend">
                            ${legendHTML}
                        </div>
                    `
                    : ""
            }

        </div>
    `;


    calendars.forEach(calendar => {

        calendar.innerHTML = html;

    });


    document
        .querySelectorAll("#backToCalendar")
        .forEach(button => {

            button.addEventListener(
                "click",
                renderCalendar
            );

        });


    document
        .querySelectorAll(".complete-plan-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    togglePlanCompleted(
                        button.dataset.planId
                    );

                }
            );

        });


    document
        .querySelectorAll(".delete-plan-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    deletePlan(
                        button.dataset.planId,
                        day
                    );

                }
            );

        });
}


/* =========================
   پنل برنامه
   ========================= */

function openStudyPanel(day = 1) {

    selectedDay = day;


    let panel =
        document.getElementById(
            "studyPanel"
        );


    if (panel) {
        panel.remove();
    }


    panel =
        document.createElement("div");

    panel.id = "studyPanel";

    document.body.appendChild(panel);


    let subjectsHTML = "";


    subjects.forEach(subject => {

        subjectsHTML += `

            <option value="${subject.name}">
                ${subject.name}
            </option>
        `;

    });


    panel.innerHTML = `

        <div class="study-panel-overlay"></div>

        <div class="study-panel-box">

            <button
                class="study-panel-close"
                id="closeStudyPanel"
                type="button"
            >
                ×
            </button>


            <div class="study-panel-header">

                <span>📚</span>

                <div>

                    <h3>
                        برنامه مطالعه
                    </h3>

                    <p>
                        ${toPersianNumber(day)}
                        ${monthNames[currentMonth - 1]}
                        ${toPersianNumber(currentYear)}
                    </p>

                </div>

            </div>


            <label>
                شروع مطالعه
            </label>

            <select id="studyStart">
                ${createTimeOptions()}
            </select>


            <label>
                پایان مطالعه
            </label>

            <select id="studyEnd">
                ${createTimeOptions()}
            </select>


            <label>
                درس
            </label>

            <select id="studySubject">
                ${subjectsHTML}
            </select>


            <button
                id="saveStudyPlan"
                class="save-study-button"
                type="button"
            >
                ✓ ثبت برنامه
            </button>

        </div>
    `;


    document.getElementById(
        "studyStart"
    ).value = "08:00";


    document.getElementById(
        "studyEnd"
    ).value = "10:00";


    document
        .getElementById("closeStudyPanel")
        .addEventListener(
            "click",
            closeStudyPanel
        );


    document
        .querySelector(
            ".study-panel-overlay"
        )
        .addEventListener(
            "click",
            closeStudyPanel
        );


    document
        .getElementById("saveStudyPlan")
        .addEventListener(
            "click",
            () => saveStudyPlan(day)
        );
}


/* =========================
   ذخیره برنامه
   ========================= */

function saveStudyPlan(day) {

    const start =
        document.getElementById(
            "studyStart"
        ).value;


    const end =
        document.getElementById(
            "studyEnd"
        ).value;


    const subjectName =
        document.getElementById(
            "studySubject"
        ).value;


    const duration =
        calculateDuration(
            start,
            end
        );


    if (duration <= 0) {

        alert(
            "ساعت پایان باید بعد از ساعت شروع باشد."
        );

        return;
    }


    const subject =
        subjects.find(
            item =>
                item.name === subjectName
        );


    const key =
        getDayKey(
            currentYear,
            currentMonth,
            day
        );


    if (!studyPlans[key]) {
        studyPlans[key] = [];
    }


    const newStart =
        timeToMinutes(start);

    const newEnd =
        timeToMinutes(end);


    if (settings.overlapWarning) {

        const overlaps =
            studyPlans[key].some(plan => {

                const existingStart =
                    timeToMinutes(plan.start);

                const existingEnd =
                    timeToMinutes(plan.end);

                return (
                    newStart < existingEnd &&
                    newEnd > existingStart
                );

            });


        if (overlaps) {

            alert(
                "این بازه زمانی با یک برنامه دیگر تداخل دارد."
            );

            return;
        }

    }


    studyPlans[key].push({

        id:
            Date.now().toString() +
            Math.random()
                .toString(36)
                .substring(2, 8),

        start: start,

        end: end,

        duration: duration,

        subject: subject.name,

        color: subject.color,

        studied: false

    });


    saveData();

    closeStudyPanel();

    renderCalendar();

    updateDashboard();

    updateStats();

}


/* =========================
   تغییر وضعیت مطالعه
   ========================= */

function togglePlanCompleted(planId) {

    for (const key in studyPlans) {

        const plan =
            studyPlans[key].find(
                item =>
                    item.id === planId
            );


        if (plan) {

            plan.studied =
                !plan.studied;

            saveData();

            renderDaySchedule(
                Number(
                    key.split("-")[2]
                )
            );

            updateDashboard();

            updateStats();

            return;
        }

    }
}


/* =========================
   حذف برنامه
   ========================= */

function deletePlan(planId, day) {

    const key =
        getDayKey(
            currentYear,
            currentMonth,
            day
        );


    if (!studyPlans[key]) {
        return;
    }


    studyPlans[key] =
        studyPlans[key].filter(
            plan =>
                plan.id !== planId
        );


    saveData();

    renderDaySchedule(day);

    updateDashboard();

    updateStats();
}


/* =========================
   بستن پنل
   ========================= */

function closeStudyPanel() {

    const panel =
        document.getElementById(
            "studyPanel"
        );

    if (panel) {
        panel.remove();
    }
}


/* =========================
   داشبورد
   ========================= */

function updateDashboard() {

    const todayPlans =
        getAllPlansForCurrentMonth();


    let totalTodayMinutes = 0;

    let completedToday = 0;


    todayPlans.forEach(plan => {

        if (plan.studied) {

            totalTodayMinutes +=
                plan.duration;

            completedToday++;

        }

    });


    const studyTime =
        document.getElementById(
            "todayStudyTime"
        );


    if (studyTime) {

        studyTime.textContent =
            totalTodayMinutes === 0
                ? "۰ ساعت"
                : formatDuration(
                    totalTodayMinutes
                );

    }


    const plansCount =
        document.getElementById(
            "todayPlansCount"
        );


    if (plansCount) {

        plansCount.textContent =
            `${toPersianNumber(completedToday)} برنامه`;

    }


    const casesElement =
        document.getElementById(
            "casesCount"
        );


    if (casesElement) {

        casesElement.textContent =
            `${toPersianNumber(cases.length)} کیس`;

    }


    const activeDays =
        document.getElementById(
            "activeDaysCount"
        );


    if (activeDays) {

        let count = 0;

        Object.values(studyPlans)
            .forEach(plans => {

                if (
                    plans.some(
                        plan =>
                            plan.studied
                    )
                ) {
                    count++;
                }

            });


        activeDays.textContent =
            `${toPersianNumber(count)} روز`;

    }
}


/* =========================
   کل برنامه‌های ماه
   ========================= */

function getAllPlansForCurrentMonth() {

    let allPlans = [];


    const prefix =
        `${currentYear}-${currentMonth}-`;


    Object.keys(studyPlans)
        .forEach(key => {

            if (key.startsWith(prefix)) {

                allPlans =
                    allPlans.concat(
                        studyPlans[key]
                    );

            }

        });


    return allPlans;
}


/* =========================
   آمار
   ========================= */

function updateStats() {

    let totalMinutes = 0;
    let totalPlans = 0;
    let completedPlans = 0;


    Object.values(studyPlans)
        .forEach(plans => {

            plans.forEach(plan => {

                totalPlans++;

                if (plan.studied) {

                    completedPlans++;

                    totalMinutes +=
                        plan.duration;

                }

            });

        });


    const totalStudyTime =
        document.getElementById(
            "totalStudyTime"
        );


    if (totalStudyTime) {

        totalStudyTime.textContent =
            totalMinutes === 0
                ? "۰ ساعت"
                : formatDuration(
                    totalMinutes
                );

    }


    const totalPlansElement =
        document.getElementById(
            "totalPlansCount"
        );


    if (totalPlansElement) {

        totalPlansElement.textContent =
            toPersianNumber(
                totalPlans
            );

    }


    const completedElement =
        document.getElementById(
            "completedPlansCount"
        );


    if (completedElement) {

        completedElement.textContent =
            toPersianNumber(
                completedPlans
            );

    }
}


/* =========================
   منوی سایت
   ========================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    const sections = {

        dashboard:
            document.getElementById(
                "dashboardSection"
            ),

        calendar:
            document.getElementById(
                "calendarSection"
            ),

        subjects:
            document.getElementById(
                "subjectsSection"
            ),

        cases:
            document.getElementById(
                "casesSection"
            ),

        review:
            document.getElementById(
                "reviewSection"
            ),

        stats:
            document.getElementById(
                "statsSection"
            ),

        drugs:
            document.getElementById(
                "drugsSection"
            ),

        settings:
            document.getElementById(
                "settingsSection"
            )

    };


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();


                const sectionName =
                    item.dataset.section;


                Object.values(sections)
                    .forEach(section => {

                        if (section) {

                            section.style.display =
                                "none";

                        }

                    });


                if (
                    sections[sectionName]
                ) {

                    sections[sectionName]
                        .style.display =
                        "block";

                }


                navItems.forEach(nav => {

                    nav.classList.remove(
                        "active"
                    );

                });


                item.classList.add(
                    "active"
                );


                if (
                    sectionName === "calendar"
                ) {

                    renderCalendar();

                }


                if (
                    sectionName === "dashboard"
                ) {

                    renderCalendar();
                    updateDashboard();

                }


                if (
                    sectionName === "cases"
                ) {

                    renderCases();

                }


                if (
                    sectionName === "stats"
                ) {

                    updateStats();

                }


                if (
                    sectionName === "settings"
                ) {

                    loadSettings();

                }

            }
        );

    });
}


/* =========================
   دکمه برنامه جدید
   ========================= */

function setupNewPlanButtons() {

    const buttons =
        document.querySelectorAll(
            "#newPlanButton, #calendarNewPlanButton"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openStudyPanel(1);

            }
        );

    });
}


/* =========================
   کیس‌ها
   ========================= */

function renderCases() {

    const container =
        document.getElementById(
            "casesContainer"
        );


    if (!container) {
        return;
    }


    if (cases.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="calendar-icon">
                    🩺
                </div>

                <h3>
                    هنوز کیسی ثبت نشده
                </h3>

                <p>
                    برای شروع روی «کیس جدید» بزن.
                </p>

            </div>

        `;

        return;
    }


    let html = "";


    cases.forEach((item, index) => {

        html += `

            <div class="case-card">

                <div>

                    <h3>
                        ${item.title}
                    </h3>

                    <p>
                        ${item.description}
                    </p>

                </div>


                <button
                    class="delete-case-button"
                    data-index="${index}"
                    type="button"
                >
                    حذف
                </button>

            </div>

        `;

    });


    container.innerHTML = html;


    container
        .querySelectorAll(
            ".delete-case-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    cases.splice(
                        index,
                        1
                    );

                    saveData();

                    renderCases();

                    updateDashboard();

                }
            );

        });
}


/* =========================
   ساخت کیس
   ========================= */

function openCasePanel() {

    const panel =
        document.createElement(
            "div"
        );

    panel.id = "casePanel";


    panel.innerHTML = `

        <div class="study-panel-overlay"></div>

        <div class="study-panel-box">

            <button
                class="study-panel-close"
                id="closeCasePanel"
                type="button"
            >
                ×
            </button>


            <div class="study-panel-header">

                <span>🩺</span>

                <div>

                    <h3>
                        ثبت کیس بالینی
                    </h3>

                    <p>
                        کیس جدید
                    </p>

                </div>

            </div>


            <label>
                عنوان کیس
            </label>

            <input
                id="caseTitle"
                type="text"
                placeholder="مثلاً STEMI"
            >


            <label>
                توضیحات
            </label>

            <textarea
                id="caseDescription"
                rows="5"
                placeholder="شرح کوتاه کیس..."
            ></textarea>


            <button
                id="saveCaseButton"
                class="save-study-button"
                type="button"
            >
                ✓ ثبت کیس
            </button>

        </div>
    `;


    document.body.appendChild(
        panel
    );


    document
        .getElementById(
            "closeCasePanel"
        )
        .addEventListener(
            "click",
            () => panel.remove()
        );


    panel
        .querySelector(
            ".study-panel-overlay"
        )
        .addEventListener(
            "click",
            () => panel.remove()
        );


    document
        .getElementById(
            "saveCaseButton"
        )
        .addEventListener(
            "click",
            () => {

                const title =
                    document.getElementById(
                        "caseTitle"
                    ).value.trim();


                const description =
                    document.getElementById(
                        "caseDescription"
                    ).value.trim();


                if (!title) {

                    alert(
                        "عنوان کیس را وارد کن."
                    );

                    return;
                }


                cases.push({

                    id: Date.now(),

                    title: title,

                    description:
                        description ||
                        "بدون توضیحات"

                });


                saveData();

                panel.remove();

                renderCases();

                updateDashboard();

            }
        );
}


/* =========================
   تنظیمات
   ========================= */

function loadSettings() {

    const schedule =
        document.getElementById(
            "schedule24Toggle"
        );

    const overlap =
        document.getElementById(
            "overlapWarningToggle"
        );


    if (schedule) {

        schedule.checked =
            settings.schedule24;

    }


    if (overlap) {

        overlap.checked =
            settings.overlapWarning;

    }
}


function setupSettings() {

    const button =
        document.getElementById(
            "saveSettingsButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            settings.schedule24 =
                document.getElementById(
                    "schedule24Toggle"
                ).checked;


            settings.overlapWarning =
                document.getElementById(
                    "overlapWarningToggle"
                ).checked;


            saveData();


            alert(
                "تنظیمات با موفقیت ذخیره شد."
            );

        }
    );
}


/* =========================
   شروع
   ========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupNavigation();

        setupNewPlanButtons();

        setupSettings();


        const newCaseButton =
            document.getElementById(
                "newCaseButton"
            );


        if (newCaseButton) {

            newCaseButton.addEventListener(
                "click",
                openCasePanel
            );

        }


        renderCalendar();

        updateDashboard();

        updateStats();

    }
);
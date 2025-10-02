<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Attendance Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        .neon-glow {
            box-shadow: 0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1);
        }

        .neon-border {
            border: 1px solid rgba(6, 182, 212, 0.5);
        }

        .card-hover {
            transition: all 0.3s ease;
        }

        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .gradient-bg {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        }

        .attendance-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin: 2px;
        }

        .present {
            background-color: #10b981;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
        }

        .absent {
            background-color: #ef4444;
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        .loading-shimmer {
            background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.1), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }

            100% {
                background-position: 200% 0;
            }
        }

        .neon-text {
            color: #06b6d4;
            text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .day-block {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid transparent;
        }

        .day-block:hover {
            border-color: rgba(6, 182, 212, 0.6);
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
            transform: scale(1.1);
            background-color: rgba(6, 182, 212, 0.1);
        }

        .day-present {
            background-color: rgba(16, 185, 129, 0.2);
            border-color: rgba(16, 185, 129, 0.4);
            color: #10b981;
        }

        .day-absent {
            background-color: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.4);
            color: #ef4444;
        }

        .day-default {
            background-color: rgba(71, 85, 105, 0.3);
            color: #94a3b8;
        }

        .day-sunday {
            background-color: rgba(107, 114, 128, 0.3);
            border-color: rgba(107, 114, 128, 0.4);
            color: #9ca3af;
            opacity: 0.6;
        }

        .calendar-fade-out {
            opacity: 0;
            transform: scale(0.95);
        }

        .calendar-fade-in {
            opacity: 1;
            transform: scale(1);
        }
    </style>
</head>

<body class="gradient-bg min-h-screen text-white">

    <header class="py-8 px-6">
        <div class="max-w-7xl mx-auto">
            <h1 class="text-4xl md:text-5xl font-bold text-center neon-text mb-2">
                Student Attendance Dashboard
            </h1>
            <div class="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full neon-glow mb-6">
            </div>


            <div class="flex justify-center">
                <button id="refresh-all-btn"
                    class="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl neon-border transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-cyan-500/25">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                        </path>
                    </svg>
                    <span>Refresh All Students</span>
                </button>
            </div>
        </div>
    </header>


    <main class="px-6 pb-12">
        <div class="max-w-7xl mx-auto">

            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

                <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 neon-border card-hover">
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-semibold text-cyan-400">Student #1</h3>
                            <button
                                class="refresh-btn text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                                title="Refresh student data">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                                    </path>
                                </svg>
                            </button>
                        </div>
                        <div class="w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div class="space-y-4">

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Name:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>


                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Student ID:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>


                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">This Month:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>


                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Overall:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>


                        <div class="pt-4">
                            <h4 class="text-slate-300 font-medium mb-3">Attendance Calendar</h4>


                            <div class="flex items-center justify-between mb-4 bg-slate-900/50 rounded-lg p-3">
                                <button
                                    class="month-prev text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </button>
                                <span class="current-month text-white font-medium text-sm">Loading...</span>
                                <button
                                    class="month-next text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>


                            <div class="calendar-container overflow-hidden bg-slate-900/50 rounded-lg p-4">
                                <div
                                    class="calendar-grid grid grid-cols-7 gap-2 transition-transform duration-500 ease-in-out">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 neon-border card-hover">
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-semibold text-cyan-400">Student #2</h3>
                            <button
                                class="refresh-btn text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                                title="Refresh student data">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                                    </path>
                                </svg>
                            </button>
                        </div>
                        <div class="w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Name:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Student ID:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">This Month:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Overall:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="pt-4">
                            <h4 class="text-slate-300 font-medium mb-3">Attendance Calendar</h4>


                            <div class="flex items-center justify-between mb-4 bg-slate-900/50 rounded-lg p-3">
                                <button
                                    class="month-prev text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </button>
                                <span class="current-month text-white font-medium text-sm">Loading...</span>
                                <button
                                    class="month-next text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>


                            <div class="calendar-container overflow-hidden bg-slate-900/50 rounded-lg p-4">
                                <div
                                    class="calendar-grid grid grid-cols-7 gap-2 transition-transform duration-500 ease-in-out">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 neon-border card-hover">
                    <div class="mb-6">
                        <div class="flex justify-between items-center mb-2">
                            <h3 class="text-xl font-semibold text-cyan-400">Student #3</h3>
                            <button
                                class="refresh-btn text-cyan-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-slate-700/50"
                                title="Refresh student data">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                                    </path>
                                </svg>
                            </button>
                        </div>
                        <div class="w-16 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div class="space-y-4">
                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Name:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Student ID:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">This Month:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-slate-700/50">
                            <span class="text-slate-300 font-medium">Overall:</span>
                            <span class="text-white loading-shimmer px-3 py-1 rounded">-</span>
                        </div>

                        <div class="pt-4">
                            <h4 class="text-slate-300 font-medium mb-3">Attendance Calendar</h4>


                            <div class="flex items-center justify-between mb-4 bg-slate-900/50 rounded-lg p-3">
                                <button
                                    class="month-prev text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </button>
                                <span class="current-month text-white font-medium text-sm">Loading...</span>
                                <button
                                    class="month-next text-cyan-400 hover:text-cyan-300 transition-colors p-1 rounded hover:bg-slate-800/50">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>


                            <div class="calendar-container overflow-hidden bg-slate-900/50 rounded-lg p-4">
                                <div
                                    class="calendar-grid grid grid-cols-7 gap-2 transition-transform duration-500 ease-in-out">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </main>

    <script>

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);


        const today = new Date();
        let currentMonth = today.getMonth();
        let currentYear = 2025;
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        }

        function getDaysInMonth(month, year) {
            if (month === 1 && isLeapYear(year)) {
                return 29;
            }
            return daysInMonth[month];
        }

        function generateCalendar(month, year, attendanceData = null, holidayData = null) {
            const days = getDaysInMonth(month, year);
            const calendarHTML = [];


            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


            weekdays.forEach(weekday => {
                calendarHTML.push(`
                    <div class="weekday-header text-xs font-medium text-slate-400 text-center py-2">
                        ${weekday}
                    </div>
                `);
            });


            const firstDay = new Date(year, month, 1).getDay();


            for (let i = 0; i < firstDay; i++) {
                calendarHTML.push(`
                    <div class="day-block day-empty opacity-30">
                        <span class="text-xs"></span>
                    </div>
                `);
            }


            const today = new Date();
            const todayYear = today.getFullYear();
            const todayMonth = today.getMonth();
            const todayDate = today.getDate();

            for (let day = 1; day <= days; day++) {
                const dayOfWeek = (firstDay + day - 1) % 7;
                const isSunday = dayOfWeek === 0;


                const currentDate = new Date(year, month, day);
                const isFutureDate = currentDate > today;

                let dayClass = 'day-default';
                let status = 'No data';


                const dayOfYear = getDayOfYear(year, month, day);


                const isHoliday = holidayData && holidayData[dayOfYear] === true;

                if (isSunday || isHoliday) {
                    dayClass = 'day-sunday';
                    status = isHoliday ? 'Holiday' : 'Sunday (Holiday)';
                } else if (isFutureDate) {
                    dayClass = 'day-default';
                    status = 'Future date - No data';
                } else if (attendanceData && attendanceData[dayOfYear] !== undefined) {
                    const isPresent = attendanceData[dayOfYear] === true;
                    dayClass = isPresent ? 'day-present' : 'day-absent';
                    status = isPresent ? 'Present' : 'Absent';
                } else {

                    dayClass = 'day-absent';
                    status = 'Absent (No data)';
                }

                calendarHTML.push(`
                    <div class="day-block ${dayClass}" title="Day ${day}: ${status}">
                        <span class="text-xs">${day}</span>
                    </div>
                `);
            }

            return calendarHTML.join('');
        }


        function getDayOfYear(year, month, day) {
            const date = new Date(year, month, day);
            const start = new Date(year, 0, 1);
            return Math.floor((date - start) / (24 * 60 * 60 * 1000));
        }

        function updateCalendar(animated = false) {
            const calendarGrids = document.querySelectorAll('.calendar-grid');
            const monthDisplays = document.querySelectorAll('.current-month');


            monthDisplays.forEach(display => {
                display.textContent = `${months[currentMonth]} ${currentYear}`;
            });


            calendarGrids.forEach((grid, index) => {
                const studentNumber = index + 1;
                const studentData = getStoredStudentData(studentNumber);


                if (studentData) {
                    const studentCard = grid.closest('.bg-slate-800\\/50');
                    const monthlyField = studentCard.querySelectorAll('.space-y-4 span:last-child')[2];
                    const currentMonthAttendance = calculateCurrentMonthAttendance(studentData);
                    monthlyField.textContent = currentMonthAttendance;
                }

                const newCalendarHTML = generateCalendar(
                    currentMonth,
                    currentYear,
                    studentData ? studentData.attendanceCalendar : null,
                    studentData ? studentData.holidayCalendar : null
                );

                if (animated) {

                    grid.classList.add('calendar-fade-out');
                    setTimeout(() => {
                        grid.innerHTML = newCalendarHTML;
                        grid.classList.remove('calendar-fade-out');
                        grid.classList.add('calendar-fade-in');
                        setTimeout(() => {
                            grid.classList.remove('calendar-fade-in');
                        }, 300);
                    }, 200);
                } else {

                    grid.innerHTML = newCalendarHTML;
                }
            });
        }

        function initializeCalendars() {

            document.querySelectorAll('.month-prev').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentMonth--;
                    if (currentMonth < 0) {
                        currentMonth = 11;

                    }
                    updateCalendar(true);
                });
            });

            document.querySelectorAll('.month-next').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentMonth++;
                    if (currentMonth > 11) {
                        currentMonth = 0;

                    }
                    updateCalendar(true);
                });
            });


            updateCalendar(false);
        }


        document.addEventListener('DOMContentLoaded', initializeCalendars);


        function initializeRefreshButtons() {
            document.querySelectorAll('.refresh-btn').forEach((btn, index) => {
                btn.addEventListener('click', function () {
                    const studentCard = this.closest('.bg-slate-800\\/50');
                    const svg = this.querySelector('svg');
                    const studentNumber = index + 1;


                    svg.style.animation = 'spin 1s linear infinite';


                    const dataFields = studentCard.querySelectorAll('.space-y-4 span:last-child');
                    dataFields.forEach(field => {
                        field.textContent = '-';
                        field.classList.add('loading-shimmer');
                    });


                    const calendarGrid = studentCard.querySelector('.calendar-grid');
                    calendarGrid.innerHTML = generateCalendar(currentMonth, currentYear);


                    refreshStudentData(studentNumber, studentCard, svg, dataFields, calendarGrid);
                });
            });
        }


        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);


        function refreshAllStudents() {
            console.log('Refreshing all students...');


            document.querySelectorAll('.refresh-btn svg').forEach(svg => {
                svg.style.animation = 'spin 1s linear infinite';
            });

            document.querySelectorAll('.space-y-4 span:last-child').forEach(field => {
                field.textContent = '-';
                field.classList.add('loading-shimmer');
            });


            fetchFreshCSVData()
                .then(() => {

                    document.querySelectorAll('.refresh-btn').forEach((btn, index) => {
                        const studentCard = btn.closest('.bg-slate-800\\/50');
                        const svg = btn.querySelector('svg');
                        const studentNumber = index + 1;
                        const dataFields = studentCard.querySelectorAll('.space-y-4 span:last-child');
                        const calendarGrid = studentCard.querySelector('.calendar-grid');

                        refreshStudentData(studentNumber, studentCard, svg, dataFields, calendarGrid);
                    });
                })
                .catch(error => {
                    console.error('Error fetching CSV data:', error);

                    document.querySelectorAll('.refresh-btn').forEach(btn => {
                        const studentCard = btn.closest('.bg-slate-800\\/50');
                        const svg = btn.querySelector('svg');
                        const dataFields = studentCard.querySelectorAll('.space-y-4 span:last-child');
                        handleRefreshError(error, svg, dataFields);
                    });
                });
        }


        document.addEventListener('DOMContentLoaded', () => {
            initializeRefreshButtons();


            document.getElementById('refresh-all-btn').addEventListener('click', () => {
                refreshAllStudents();
            });


            setTimeout(() => {
                refreshAllStudents();
            }, 500);
        });




        let cachedCSVData = null;
        let lastFetchTime = null;


        let storedStudentData = {};


        function getStoredStudentData(studentNumber) {
            return storedStudentData[studentNumber] || null;
        }


        function calculateCurrentMonthAttendance(studentData) {
            if (!studentData || !studentData.attendanceCalendar) return '0/0';


            const now = new Date();
            const realCurrentMonth = now.getMonth();
            const realCurrentYear = 2025;

            let monthPresent = 0;
            let monthWorking = 0;
            const monthStart = getDayOfYear(realCurrentYear, realCurrentMonth, 1);
            const monthEnd = monthStart + getDaysInMonth(realCurrentMonth, realCurrentYear) - 1;

            for (let dayOfYear = monthStart; dayOfYear <= monthEnd && dayOfYear < 365; dayOfYear++) {

                const isHoliday = studentData.holidayCalendar && studentData.holidayCalendar[dayOfYear];


                const dateForDay = new Date(realCurrentYear, 0, dayOfYear + 1);
                const isSunday = dateForDay.getDay() === 0;

                if (!isSunday && !isHoliday) {
                    monthWorking++;
                    if (studentData.attendanceCalendar[dayOfYear] === true) {
                        monthPresent++;
                    }
                }
            }

            return `${monthPresent}/${monthWorking}`;
        }


        function fetchFreshCSVData() {
            const timestamp = new Date().getTime();
            const csvUrl = `https://yourdomain.com/rfid/attendance.csv?t=${timestamp}`;

            console.log(`Fetching fresh CSV file at ${new Date().toLocaleTimeString()}`);


            cachedHolidayData = null;

            return fetch(csvUrl, {
                method: 'GET',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(csvText => {
                    cachedCSVData = csvText;
                    lastFetchTime = new Date().getTime();
                    console.log(`Fresh CSV data cached successfully at ${new Date().toLocaleTimeString()}`);
                    return csvText;
                });
        }


        function refreshStudentData(studentNumber, studentCard, svg, dataFields, calendarGrid) {
            console.log(`Loading Student #${studentNumber} from cached data`);

            try {
                if (!cachedCSVData) {
                    throw new Error('No cached CSV data available');
                }

                const studentData = parseCSVForStudent(cachedCSVData, studentNumber);
                if (studentData) {
                    updateStudentCard(studentData, dataFields, calendarGrid, svg);
                } else {
                    throw new Error(`Student #${studentNumber} not found in CSV`);
                }
            } catch (error) {
                console.error(`Error loading Student #${studentNumber}:`, error);
                handleRefreshError(error, svg, dataFields);
            }
        }


        let cachedHolidayData = null;


        function parseCSVForStudent(csvText, studentNumber) {
            try {
                console.log(`Parsing CSV for Student #${studentNumber}`);
                console.log('Raw CSV length:', csvText.length);

                const lines = csvText.trim().split('\n');
                console.log('Total lines in CSV:', lines.length);

                if (lines.length < 2) {
                    console.error('CSV file is empty or has no data rows');
                    throw new Error('CSV file is empty or invalid');
                }


                const headers = lines[0].split(',').map(h => h.trim());
                console.log('CSV Headers:', headers);
                console.log('Number of columns:', headers.length);


                if (!cachedHolidayData) {
                    cachedHolidayData = [];
                    const attendanceStartIndex = 4;


                    for (let day = 0; day < 365; day++) {
                        const columnIndex = attendanceStartIndex + day;
                        if (columnIndex < headers.length) {
                            const headerValue = headers[columnIndex].toLowerCase().trim();

                            const isHoliday = headerValue === 'h';
                            cachedHolidayData.push(isHoliday);
                            if (isHoliday) {
                                console.log(`Day ${day + 1} of year: "${headers[columnIndex]}" -> Holiday (from header)`);
                            }
                        } else {
                            cachedHolidayData.push(false);
                        }
                    }


                    for (let rowIndex = 1; rowIndex < Math.min(lines.length, 4); rowIndex++) {
                        const dataRow = lines[rowIndex].split(',').map(cell => cell ? cell.trim() : '');
                        for (let day = 0; day < 365; day++) {
                            const columnIndex = attendanceStartIndex + day;
                            if (columnIndex < dataRow.length) {
                                const cellValue = dataRow[columnIndex].toLowerCase().trim();
                                if (cellValue === 'h' && !cachedHolidayData[day]) {
                                    cachedHolidayData[day] = true;
                                    console.log(`Day ${day + 1} of year: Found 'h' in data row ${rowIndex} -> Holiday`);
                                }
                            }
                        }
                    }

                    console.log(`Parsed holiday data for full year: ${cachedHolidayData.filter(h => h).length} holidays out of 365 days`);
                }


                const dataRowIndex = studentNumber;

                if (dataRowIndex >= lines.length) {
                    console.error(`Student #${studentNumber} row not found. Available rows: ${lines.length - 1}`);

                    return {
                        name: `Student ${studentNumber}`,
                        schoolId: `ID${studentNumber}`,
                        monthlyAttendance: '0/0',
                        overallAttendance: '0%',
                        attendanceCalendar: new Array(365).fill(false),
                        holidayCalendar: cachedHolidayData || new Array(365).fill(false)
                    };
                }


                const rawRow = lines[dataRowIndex];
                console.log(`Raw row for Student #${studentNumber}:`, rawRow);


                const studentRow = rawRow.split(',').map(cell => cell ? cell.trim() : '');
                console.log(`Parsed row for Student #${studentNumber}:`, studentRow);
                console.log('Row length:', studentRow.length);


                const studentData = {};


                studentData.name = studentRow[1] || `Student ${studentNumber}`;
                studentData.schoolId = studentRow[2] || `ID${studentNumber}`;

                console.log('Extracted name:', studentData.name);
                console.log('Extracted ID:', studentData.schoolId);


                const attendanceStartIndex = 4;

                studentData.attendanceCalendar = [];
                studentData.holidayCalendar = cachedHolidayData || new Array(365).fill(false);
                let presentDays = 0;
                let totalWorkingDays = 0;


                let currentMonthPresent = 0;
                let currentMonthWorking = 0;
                const now = new Date();
                const realCurrentMonth = now.getMonth();
                const currentMonthStart = getDayOfYear(currentYear, realCurrentMonth, 1);
                const currentMonthEnd = currentMonthStart + getDaysInMonth(realCurrentMonth, currentYear) - 1;


                for (let dayOfYear = 0; dayOfYear < 365; dayOfYear++) {
                    const columnIndex = attendanceStartIndex + dayOfYear;
                    const isHoliday = studentData.holidayCalendar[dayOfYear];


                    const dateForDay = new Date(currentYear, 0, dayOfYear + 1);
                    const isSunday = dateForDay.getDay() === 0;

                    if (!isHoliday && !isSunday) {
                        totalWorkingDays++;


                        if (dayOfYear >= currentMonthStart && dayOfYear <= currentMonthEnd) {
                            currentMonthWorking++;
                        }
                    }

                    if (columnIndex < studentRow.length) {
                        const attendance = studentRow[columnIndex];
                        const cellValue = attendance ? attendance.toString().trim() : '';


                        const isPresent = !isHoliday && !isSunday && cellValue && cellValue !== '' && cellValue !== 'undefined' && cellValue !== 'null' && cellValue.toLowerCase() !== 'h';
                        studentData.attendanceCalendar.push(isPresent);

                        if (isPresent) {
                            presentDays++;


                            if (dayOfYear >= currentMonthStart && dayOfYear <= currentMonthEnd) {
                                currentMonthPresent++;
                            }
                        }

                        if (dayOfYear < 10 || (dayOfYear >= currentMonthStart && dayOfYear <= Math.min(currentMonthStart + 10, currentMonthEnd))) {
                            console.log(`Day ${dayOfYear + 1} of year: "${cellValue}" -> ${isHoliday ? 'Holiday' : (isPresent ? 'Present' : 'Absent')}`);
                        }
                    } else {

                        studentData.attendanceCalendar.push(false);
                        if (dayOfYear < 10) {
                            console.log(`Day ${dayOfYear + 1} of year: No data -> ${isHoliday ? 'Holiday' : 'Absent'}`);
                        }
                    }
                }


                const overallAttendancePercentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 100) : 0;
                studentData.monthlyAttendance = `${currentMonthPresent}/${currentMonthWorking}`;
                studentData.overallAttendance = `${presentDays}/${totalWorkingDays} (${overallAttendancePercentage}%)`;

                console.log(`Final data for Student #${studentNumber}:`, {
                    name: studentData.name,
                    schoolId: studentData.schoolId,
                    monthlyAttendance: studentData.monthlyAttendance,
                    overallAttendance: studentData.overallAttendance,
                    attendanceDays: studentData.attendanceCalendar.length,
                    presentDays: presentDays,
                    totalWorkingDays: totalWorkingDays,
                    holidays: studentData.holidayCalendar.filter(h => h).length
                });

                return studentData;

            } catch (error) {
                console.error(`Error parsing CSV for Student #${studentNumber}:`, error);

                return {
                    name: `Student ${studentNumber}`,
                    schoolId: `ID${studentNumber}`,
                    monthlyAttendance: '0/0',
                    overallAttendance: '0%',
                    attendanceCalendar: new Array(365).fill(false),
                    holidayCalendar: new Array(365).fill(false)
                };
            }
        }


        function updateStudentCard(data, dataFields, calendarGrid, svg) {
            svg.style.animation = '';


            const studentNumber = Array.from(document.querySelectorAll('.refresh-btn')).indexOf(svg.closest('.refresh-btn')) + 1;
            storedStudentData[studentNumber] = data;


            dataFields[0].textContent = data.name || 'N/A';
            dataFields[0].classList.remove('loading-shimmer');

            dataFields[1].textContent = data.schoolId || 'N/A';
            dataFields[1].classList.remove('loading-shimmer');

            dataFields[2].textContent = data.monthlyAttendance || 'N/A';
            dataFields[2].classList.remove('loading-shimmer');

            dataFields[3].textContent = data.overallAttendance || 'N/A';
            dataFields[3].classList.remove('loading-shimmer');


            if (data.attendanceCalendar && Array.isArray(data.attendanceCalendar)) {
                calendarGrid.innerHTML = generateCalendar(currentMonth, currentYear, data.attendanceCalendar, data.holidayCalendar);
            }


            svg.style.color = '#10b981';
            setTimeout(() => svg.style.color = '', 1000);
        }


        function handleRefreshError(error, svg, dataFields) {
            console.error('Error refreshing student data:', error);
            svg.style.animation = '';
            dataFields.forEach(field => {
                field.textContent = 'Error loading';
                field.classList.remove('loading-shiffmmer');
            });
        }
    </script>
    <script>
        (function () {
            function c() {
                var b = a.contentDocument || a.contentWindow.document;
                if (b) {
                    var d = b.createElement('script');
                    d.innerHTML = "window.__CF$cv$params={r:'986d044100475999',t:'MTc1OTE2NTAxNS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
                    b.getElementsByTagName('head')[0].appendChild(d)
                }
            }
            if (document.body) {
                var a = document.createElement('iframe');
                a.height = 1;
                a.width = 1;
                a.style.position = 'absolute';
                a.style.top = 0;
                a.style.left = 0;
                a.style.border = 'none';
                a.style.visibility = 'hidden';
                document.body.appendChild(a);
                if ('loading' !== document.readyState) c();
                else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c);
                else {
                    var e = document.onreadystatechange || function () { };
                    document.onreadystatechange = function (b) {
                        e(b);
                        'loading' !== document.readyState && (document.onreadystatechange = e, c())
                    }
                }
            }
        })();
    </script>
</body>

</html>
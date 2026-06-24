document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const summaryEl = document.getElementById('summary');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeWeek,timeDay'
        },
        selectable: true,
        select: function (info) {
            const dateStr = info.startStr.split('T')[0]; // YYYY-MM-DD
            fetchSummary(dateStr);
        },
        // To highlight dates that have data (optional)
        eventDidMount: function(info) {
            // Not used for now
        }
    });

    calendar.render();

    async function fetchSummary(date) {
        summaryEl.innerHTML = '<div class="loading">로딩 중...</div>';
        try {
            const resp = await fetch(`/api/summary/${date}`);
            if (!resp.ok) throw new Error('Network error');
            const data = await resp.json();
            if (data.error) throw new Error(data.error);
            summaryEl.innerHTML = `<strong>${data.date}</span> 요약:<br>${data.summary.replace(/\n/g, '<br>')}`;
        } catch (e) {
            summaryEl.innerHTML = `<span class="error">오류: ${e.message}</span>`;
        }
    }

    // Optionally preload today's summary
    const today = new Date().toISOString().split('T')[0];
    fetchSummary(today);
});
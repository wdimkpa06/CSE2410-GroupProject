document.getElementById("meeting-form").addEventListener("submit", function(event) {
    event.preventDefault();
    clearErrors(); // Clear previous error messages

    const title = document.getElementById("meeting-title").value;
    const participants = document.getElementById("participants").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const recurrence = document.getElementById("recurrence").value;

    if (!validateInputs(date, time) || !validateEmails(participants)) {
        if (!validateInputs(date, time)) {
            showError(document.getElementById("date"), "Please select a valid future date and time.");
        }
        if (!validateEmails(participants)) {
            showError(document.getElementById("participants"), "Please enter valid email addresses.");
        }
        return;
    }

    addMeetingToCalendar(title, participants, date, time, recurrence);
    displayMeetings();
    const confirmationMessage = document.getElementById("confirmation-message");
    confirmationMessage.innerText = "Meeting scheduled successfully!";
    confirmationMessage.style.display = "block";
    document.getElementById("meeting-form").reset();
});

function addMeetingToCalendar(title, participants, date, time, recurrence) {
    const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
    const newMeeting = { title, participants, date, time, recurrence };

    if (recurrence !== "none") {
        const instances = generateRecurringMeetings(newMeeting);
        instances.forEach(meeting => meetings.push(meeting));
    } else {
        meetings.push(newMeeting);
    }
   
    localStorage.setItem('meetings', JSON.stringify(meetings));
}

function generateRecurringMeetings(meeting) {
    const instances = [];
    const startDate = new Date(meeting.date + " " + meeting.time);
   
    if (meeting.recurrence === "weekly") {
        for (let i = 0; i < 10; i++) { // Generate 10 instances
            const newDate = new Date(startDate);
            newDate.setDate(startDate.getDate() + (7 * i)); // Add 7 days for weekly
            instances.push({ ...meeting, date: newDate.toISOString().split('T')[0], time: meeting.time });
        }
    } else if (meeting.recurrence === "monthly") {
        for (let i = 0; i < 10; i++) { // Generate 10 instances
            const newDate = new Date(startDate);
            newDate.setMonth(startDate.getMonth() + i); // Add 1 month
            instances.push({ ...meeting, date: newDate.toISOString().split('T')[0], time: meeting.time });
        }
    } else if (meeting.recurrence === "bi-monthly") {
        for (let i = 0; i < 10; i++) { // Generate 10 instances
            const newDate = new Date(startDate);
            newDate.setMonth(startDate.getMonth() + (2 * i)); // Add 2 months
            instances.push({ ...meeting, date: newDate.toISOString().split('T')[0], time: meeting.time });
        }
    }

    return instances;
}

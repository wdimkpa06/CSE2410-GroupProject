// Toggle the display between the calendar and meetings sections
document.getElementById('nav-meetings').addEventListener('click', function () {
    document.getElementById('calendar-section').style.display = 'none'; // Hide the calendar
    document.getElementById('meeting-scheduler').style.display = 'block'; // Show the meeting scheduler
    displayMeetings(); // Display all scheduled meetings in the schedule view
});

// Toggle back to the calendar view
document.getElementById('back-to-calendar').addEventListener('click', function () {
    document.getElementById('calendar-section').style.display = 'block'; // Show the calendar
    document.getElementById('meeting-scheduler').style.display = 'none'; // Hide the meeting scheduler
    displayCalendarMeetings(); // Refresh the calendar view
});

// Function to display meetings on the calendar
function displayCalendarMeetings() {
    const calendarDays = document.querySelectorAll('.calendar-day'); // Ensure you have a class for calendar days
    const meetings = JSON.parse(localStorage.getItem('meetings')) || [];

    // Clear existing meeting indicators
    calendarDays.forEach(day => {
        day.innerHTML = day.getAttribute('data-date'); // Reset day content to its date
    });

    // Add meeting markers to the calendar
    meetings.forEach(meeting => {
        const meetingDate = meeting.date;
        const dayElement = document.querySelector(`[data-date="${meetingDate}"]`);
        if (dayElement) {
            const meetingIndicator = document.createElement('div');
            meetingIndicator.classList.add('meeting-indicator');
            meetingIndicator.textContent = meeting.title;
            dayElement.appendChild(meetingIndicator);
        }
    });
}

// Function to display all meetings in the schedule view
function displayMeetings() {
    const meetingsList = document.getElementById("meetings-list");
    meetingsList.innerHTML = ''; // Clear existing list
    const meetings = JSON.parse(localStorage.getItem('meetings')) || [];

    // List all meetings in the schedule view
    meetings.forEach(meeting => {
        const listItem = document.createElement("li");
        listItem.textContent = `${meeting.title} - ${meeting.date} ${meeting.time}`;
        meetingsList.appendChild(listItem);
    });
}

// Improved email validation function to handle multiple emails
function validateEmails(emails) {
    if (!emails) return false;

    const emailList = emails.split(/[,;]/).map(email => email.trim()).filter(Boolean);
    if (emailList.length === 0) return false;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validEmails = [];
    const invalidEmails = [];

    emailList.forEach(email => {
        if (emailRegex.test(email)) {
            validEmails.push(email);
        } else {
            invalidEmails.push(email);
        }
    });

    if (invalidEmails.length > 0) {
        console.error('Invalid emails:', invalidEmails);
        const errorElement = document.getElementById("participants");
        showError(errorElement, `Invalid emails: ${invalidEmails.join(', ')}`);
        return false;
    }

    return validEmails;
}

// Handle meeting form submission
document.getElementById("meeting-form").addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors(); // Clear previous error messages

    const title = document.getElementById("meeting-title").value.trim();
    const participants = document.getElementById("participants").value.trim();
    const date = document.getElementById("date").value.trim();
    const time = document.getElementById("time").value.trim();
    const recurrence = document.getElementById("recurrence").value;

    const validatedEmails = validateEmails(participants);

    if (!validateInputs(date, time) || !validatedEmails) {
        if (!validateInputs(date, time)) {
            showError(document.getElementById("date"), "Please select a valid future date and time.");
        }
        return;
    }

    addMeetingToCalendar(title, validatedEmails, date, time, recurrence);
    displayMeetings();
    displayCalendarMeetings(); // Refresh the calendar with new meeting data

    const confirmationMessage = document.getElementById("confirmation-message");
    confirmationMessage.innerText = "Meeting scheduled successfully!";
    confirmationMessage.style.display = "block";
    document.getElementById("meeting-form").reset();
});

// Save meeting data to localStorage
function addMeetingToCalendar(title, participants, date, time, recurrence) {
    const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
    const newMeeting = { title, participants, date, time };

    // Generate recurring meetings only if recurrence is set
    if (recurrence !== "none") {
        const instances = generateRecurringMeetings(newMeeting, recurrence);
        meetings.push(...instances);
    } else {
        meetings.push(newMeeting);
    }

    localStorage.setItem('meetings', JSON.stringify(meetings));
}

// Generate recurring meetings
function generateRecurringMeetings(meeting, recurrence) {
    const instances = [];
    const startDate = new Date(meeting.date + " " + meeting.time);

    for (let i = 0; i < 10; i++) {
        const newDate = new Date(startDate);
        if (recurrence === "weekly") {
            newDate.setDate(startDate.getDate() + (7 * i)); // Weekly recurrence
        } else if (recurrence === "monthly") {
            newDate.setMonth(startDate.getMonth() + i); // Monthly recurrence
        } else if (recurrence === "bi-monthly") {
            newDate.setMonth(startDate.getMonth() + (2 * i)); // Bi-monthly recurrence
        } else {
            break; // Break the loop for invalid or 'none' recurrence
        }

        instances.push({ ...meeting, date: newDate.toISOString().split('T')[0] });
    }

    return instances;
}

// Validate date and time
function validateInputs(date, time) {
    const meetingDate = new Date(date + " " + time);
    const currentDate = new Date();
    return meetingDate > currentDate;
}

// Display error messages
function showError(element, message) {
    const errorElement = document.createElement("span");
    errorElement.classList.add("error-message");
    errorElement.textContent = message;
    element.parentElement.appendChild(errorElement);
}

// Clear error messages
function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(error => error.remove());
}

// Toggle the display between the calendar and meetings sections
document.getElementById('nav-meetings').addEventListener('click', function () {
    document.getElementById('calendar-section').style.display = 'none'; // Hide the calendar
    document.getElementById('meeting-scheduler').style.display = 'block'; // Show the meeting scheduler
    displayMeetings(); // Display all scheduled meetings
});

// Function to display all scheduled meetings
function displayMeetings() {
    const meetingsList = document.getElementById("meetings-list");
    meetingsList.innerHTML = ''; // Clear existing list
    const meetings = JSON.parse(localStorage.getItem('meetings')) || [];
    meetings.forEach(meeting => {
        const listItem = document.createElement("li");
        listItem.textContent = `${meeting.title} - ${meeting.date} ${meeting.time}`;
        meetingsList.appendChild(listItem);
    });
}

// Function to handle the meeting form submission
document.getElementById("meeting-form").addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors(); // Clear previous error messages

    const title = document.getElementById("meeting-title").value.trim();
    const participants = document.getElementById("participants").value.trim();
    const date = document.getElementById("date").value.trim();
    const time = document.getElementById("time").value.trim();
    const recurrence = document.getElementById("recurrence").value;

    // Validate inputs
    if (!validateInputs(date, time) || !validateEmails(participants)) {
        if (!validateInputs(date, time)) {
            showError(document.getElementById("date"), "Please select a valid future date and time.");
        }
        if (!validateEmails(participants)) {
            showError(document.getElementById("participants"), "Please enter valid email addresses separated by commas.");
        }
        return;
    }

    // Save the meeting
    addMeetingToCalendar(title, participants.split(','), date, time, recurrence);
    displayMeetings();

    // Show confirmation
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

// Generate recurring meetings based on selected recurrence option
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

// Validation functions
function validateInputs(date, time) {
    const meetingDate = new Date(date + " " + time);
    const currentDate = new Date();
    return meetingDate > currentDate;
}

function validateEmails(emails) {
    // Allow multiple emails separated by commas
    const emailList = emails.split(",").map(email => email.trim()); // Split and trim each email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if every email matches the regex
    for (const email of emailList) {
        if (!emailRegex.test(email)) {
            console.error(`Invalid email: ${email}`); // Log for debugging
            return false;
        }
    }
    return true;
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

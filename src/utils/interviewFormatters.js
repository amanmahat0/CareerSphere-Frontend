/**
 * Interview-related formatting utilities
 * Used by InterviewProgressTimeline and related components
 */

/**
 * Format test type enum to display name
 * @param {string} testType - The test type from database
 * @returns {string} Formatted test type name
 */
export const formatTestType = (testType) => {
  const testTypeMap = {
    skill_assessment: "Skill Assessment",
    coding_test: "Coding Test",
    aptitude_test: "Aptitude Test",
  };
  return testTypeMap[testType] || testType || "Test";
};

/**
 * Format test deadline with countdown
 * @param {Date|string} deadlineDate - The deadline date
 * @returns {string} Formatted deadline with countdown
 */
export const formatDeadlineCountdown = (deadlineDate) => {
  if (!deadlineDate) return "No deadline set";

  const deadline = new Date(deadlineDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  if (daysRemaining === 0) {
    return "Due today";
  } else if (daysRemaining === 1) {
    return "Due tomorrow";
  } else if (daysRemaining > 1) {
    return `${daysRemaining} days remaining`;
  } else {
    const daysPassed = Math.abs(daysRemaining);
    return `Deadline passed ${daysPassed} day${daysPassed > 1 ? "s" : ""} ago`;
  }
};

/**
 * Format interview date with countdown
 * @param {Date|string} interviewDate - The interview date
 * @returns {string} Formatted countdown
 */
export const formatInterviewCountdown = (interviewDate) => {
  if (!interviewDate) return "Date not set";

  const interview = new Date(interviewDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  interview.setHours(0, 0, 0, 0);

  const daysUntil = Math.ceil((interview - today) / (1000 * 60 * 60 * 24));

  if (daysUntil === 0) {
    return "Today";
  } else if (daysUntil === 1) {
    return "Tomorrow";
  } else if (daysUntil > 1) {
    return `In ${daysUntil} days`;
  } else if (daysUntil === -1) {
    return "Yesterday";
  } else {
    return `${Math.abs(daysUntil)} days ago`;
  }
};

/**
 * Format salary with currency
 * @param {number} salary - The salary amount
 * @param {string} currency - The currency code (USD, INR, EUR, etc.)
 * @returns {string} Formatted salary
 */
export const formatSalary = (salary, currency = "USD") => {
  if (!salary) return "Not specified";

  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    });
    return formatter.format(salary) + " / year";
  } catch (error) {
    // Fallback if currency is invalid
    return `${currency} ${salary.toLocaleString()} / year`;
  }
};

/**
 * Format date to readable format
 * @param {Date|string} date - The date to format
 * @param {string} format - Format type: "short" (Jan 20), "long" (20 January 2025), "numeric" (1/20/2025)
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = "long") => {
  if (!date) return "Not set";

  const dateObj = new Date(date);

  if (format === "short") {
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else if (format === "long") {
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else {
    return dateObj.toLocaleDateString("en-US");
  }
};

/**
 * Format time to 12-hour format
 * @param {string} timeString - Time string (HH:mm format)
 * @returns {string} Formatted time (12-hour)
 */
export const formatTime = (timeString) => {
  if (!timeString) return "Not set";

  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const min = parseInt(minutes);

    const date = new Date();
    date.setHours(hour, min, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    return timeString;
  }
};

/**
 * Format withdrawn status with reason
 * @param {Object} application - The application object
 * @returns {string} Formatted withdrawn message
 */
export const formatWithdrawnStatus = (application) => {
  if (!application.withdrawalReason) {
    return "Application withdrawn by applicant";
  }
  return `Withdrawn: ${application.withdrawalReason}`;
};

/**
 * Format rejected status with reason
 * @param {Object} application - The application object
 * @returns {string} Formatted rejected message
 */
export const formatRejectedStatus = (application) => {
  if (!application.rejectionReason) {
    return "Application rejected";
  }
  return `Rejected: ${application.rejectionReason}`;
};

/**
 * Get status section name
 * @param {string} status - The status
 * @returns {string} Display name for the status
 */
export const getStatusSectionName = (status) => {
  const statusMap = {
    pending: "Pending Review",
    shortlisted: "Shortlisted",
    test: "Test Round",
    interview: "Interview Round",
    offer: "Offer Stage",
    hired: "Hired",
    withdrawn: "Withdrawn",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
};

/**
 * Build Google Calendar URL
 * @param {Object} application - The application object
 * @returns {string} Google Calendar URL or null if missing required fields
 */
export const buildGoogleCalendarUrl = (application) => {
  if (!application.interviewDate || !application.interviewTime) {
    return null;
  }

  try {
    const interviewDate = new Date(application.interviewDate);
    const [hours, minutes] = application.interviewTime.split(":");

    interviewDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Format start time as YYYYMMDDTHHmmss
    const startStr = interviewDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

    // End time = start time + 1 hour
    const endDate = new Date(interviewDate);
    endDate.setHours(endDate.getHours() + 1);
    const endStr = endDate
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

    const jobTitle = application.jobId?.title || "Interview";
    const company = application.jobId?.company || "Company";
    const title = `Interview - ${jobTitle}`;

    let description = `Interview with ${company}`;
    if (application.interviewType === "online" && application.meetingLink) {
      description += `\nMeeting link: ${application.meetingLink}`;
    } else if (application.interviewType === "offline" && application.interviewLocation) {
      description += `\nLocation: ${application.interviewLocation}`;
    }

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("dates", `${startStr}/${endStr}`);
    url.searchParams.set("details", description);

    return url.toString();
  } catch (error) {
    console.error("Error building Google Calendar URL:", error);
    return null;
  }
};

/**
 * Get step status based on current interview step
 * @param {string} stepName - The step name (pending, shortlisted, test, interview, offer, hired)
 * @param {string} currentInterviewStep - The current interview step from company side
 * @param {string} testResult - The test result (for skipped detection)
 * @returns {string} Status: "completed" | "active" | "pending" | "skipped" | "withdrawn" | "rejected"
 */
export const getStepStatus = (stepName, currentInterviewStep, testResult = null) => {
  const stepOrder = ["pending", "shortlisted", "test", "interview", "offer", "hired"];
  const currentIndex = stepOrder.indexOf(currentInterviewStep);
  const stepIndex = stepOrder.indexOf(stepName);

  // Handle withdrawn applications
  if (currentInterviewStep === "withdrawn") {
    return "withdrawn";
  }

  // Handle rejected applications
  if (currentInterviewStep === "rejected") {
    return "rejected";
  }

  // Check if test was skipped
  if (stepName === "test" && testResult === "skip") {
    return "skipped";
  }

  // If currentInterviewStep is not found in stepOrder (e.g., invalid status)
  if (currentIndex === -1) {
    return "pending";
  }

  if (stepIndex < currentIndex) {
    return "completed";
  } else if (stepIndex === currentIndex) {
    return "active";
  } else {
    return "pending";
  }
};

/**
 * Check if a step has content to display
 * (i.e., if it has been reached or completed)
 * @param {string} stepName - The step name
 * @param {string} currentInterviewStep - The current interview step from company side
 * @returns {boolean} Whether to show step content
 */
export const shouldShowStepContent = (stepName, currentInterviewStep) => {
  const stepOrder = ["pending", "shortlisted", "test", "interview", "offer", "hired"];
  const currentIndex = stepOrder.indexOf(currentInterviewStep);
  const stepIndex = stepOrder.indexOf(stepName);

  // Handle withdrawn - show all steps up to current
  if (currentInterviewStep === "withdrawn" || currentInterviewStep === "rejected") {
    return stepIndex <= currentIndex;
  }

  // Always show pending as initial step
  if (stepName === "pending") {
    return true;
  }

  // Show up to current step
  return stepIndex <= currentIndex;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Build headers - merge Content-Type with any custom headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Build config without headers from options (we've already merged them)
    const { headers: _, body, ...restOptions } = options;
    const config = {
      ...restOptions,
      headers,
    };

    if (body && typeof body === "object") {
      config.body = JSON.stringify(body);
    } else if (body) {
      config.body = body;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  async signup(fullname, email, phonenumber, password, userType = "applicant") {
    return this.request("/auth/signup", {
      method: "POST",
      body: { fullname, email, phonenumber, password, userType },
    });
  },

  async forgotPassword(email, userType = "applicant") {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: { email, userType },
    });
  },

  async verifyCode(email, code, userType = "applicant") {
    return this.request("/auth/verify-code", {
      method: "POST",
      body: { email, code, userType },
    });
  },

  async resetPassword(email, password, userType = "applicant") {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: { email, password, userType },
    });
  },

  async googleAuth(googleId, email, fullname, profilePicture, userType = "applicant") {
    return this.request("/auth/google", {
      method: "POST",
      body: { googleId, email, fullname, profilePicture, userType },
    });
  },

  // Job APIs
  async createJob(jobData) {
    return this.request("/jobs", {
      method: "POST",
      body: jobData,
    });
  },

  async getAllJobs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/jobs?${queryParams}` : "/jobs";
    return this.request(endpoint, {
      method: "GET",
    });
  },

  async getJobById(id) {
    return this.request(`/jobs/${id}`, {
      method: "GET",
    });
  },

  async updateJob(id, jobData) {
    return this.request(`/jobs/${id}`, {
      method: "PUT",
      body: jobData,
    });
  },

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: "DELETE",
    });
  },

  // Contact API
  async submitContactForm(contactData) {
    return this.request("/contact", {
      method: "POST",
      body: contactData,
    });
  },

  // Admin APIs - Applicant Management
  async getAllApplicants() {
    return this.request("/admin/applicants", {
      method: "GET",
    });
  },

  async createApplicant(applicantData) {
    return this.request("/admin/applicants", {
      method: "POST",
      body: applicantData,
    });
  },

  async updateApplicant(id, applicantData) {
    return this.request(`/admin/applicants/${id}`, {
      method: "PUT",
      body: applicantData,
    });
  },

  async deleteApplicant(id) {
    return this.request(`/admin/applicants/${id}`, {
      method: "DELETE",
    });
  },

  // Resume APIs
  async getResume() {
    const token = localStorage.getItem("token");
    return this.request("/resume", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async saveResume(resumeData) {
    const token = localStorage.getItem("token");
    return this.request("/resume/save", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: resumeData,
    });
  },

  async updatePersonalInfo(personalInfo) {
    const token = localStorage.getItem("token");
    return this.request("/resume/personal-info", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { personalInfo },
    });
  },

  async addEducation(educationData) {
    const token = localStorage.getItem("token");
    return this.request("/resume/education", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: educationData,
    });
  },

  async addExperience(experienceData) {
    const token = localStorage.getItem("token");
    return this.request("/resume/experience", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: experienceData,
    });
  },

  async updateSkills(skills) {
    const token = localStorage.getItem("token");
    return this.request("/resume/skills", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { skills },
    });
  },

  async addProject(projectData) {
    const token = localStorage.getItem("token");
    return this.request("/resume/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: projectData,
    });
  },

  async addCertification(certificationData) {
    const token = localStorage.getItem("token");
    return this.request("/resume/certifications", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: certificationData,
    });
  },

  // Job Application APIs
  async submitJobApplication(jobId, coverLetter) {
    const token = localStorage.getItem("token");
    return this.request("/applications/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: { jobId, coverLetter },
    });
  },

  async getUserApplications() {
    const token = localStorage.getItem("token");
    return this.request("/applications", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getCompanyApplications() {
    const token = localStorage.getItem("token");
    return this.request("/applications/company/all", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async getApplicationById(applicationId) {
    const token = localStorage.getItem("token");
    return this.request(`/applications/${applicationId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};


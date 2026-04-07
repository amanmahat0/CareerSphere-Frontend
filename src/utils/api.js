const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Build headers - only set Content-Type for non-FormData requests
    const headers = {};
    
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    
    headers["...options.headers"] = true;
    Object.assign(headers, options.headers);
    delete headers["...options.headers"];

    // Add Authorization token if available
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Build config without headers from options (we've already merged them)
    const { headers: _, body, ...restOptions } = options;
    const config = {
      ...restOptions,
      headers,
    };

    if (body && typeof body === "object" && !(body instanceof FormData)) {
      config.body = JSON.stringify(body);
    } else if (body) {
      config.body = body;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - Clear token and redirect to login
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          throw new Error(data.message || "Session expired. Please login again");
        }
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
    return this.request("/resume/projects", {
      method: "POST",
      body: projectData,
    });
  },

  async addCertification(certificationData) {
    return this.request("/resume/certifications", {
      method: "POST",
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

  async getCompanyApplications(companyName = null) {
    const token = localStorage.getItem("token");
    let company = companyName;
    
    // If company not provided, try to fetch from user data
    if (!company) {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          company = userData.companyname || userData.company;
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
    
    // Build query string if company is available
    const query = company ? `?company=${encodeURIComponent(company)}` : '';
    
    return this.request(`/applications/company/all${query}`, {
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

  // Shortlist application
  async shortlistApplication(applicationId) {
    return this.request(`/applications/${applicationId}/shortlist`, {
      method: "PUT",
      body: {},
    });
  },

  // Reject application
  async rejectApplication(applicationId) {
    return this.request(`/applications/${applicationId}/reject`, {
      method: "PUT",
      body: {},
    });
  },

  // Update interview step
  async updateInterviewStep(applicationId, interviewData) {
    return this.request(`/applications/${applicationId}/interview`, {
      method: "PUT",
      body: interviewData,
    });
  },

  // Company APIs
  async getCompanyProfile() {
    const token = localStorage.getItem("token");
    return this.request("/company/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async updateCompanyProfile(profileData) {
    const token = localStorage.getItem("token");
    return this.request("/company/profile/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: profileData,
    });
  },

  async uploadCompanyLogo(file) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("profilePicture", file);

    return this.request("/company/profile/picture", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  async uploadVerificationDocuments(files, documentTypes = []) {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append("documents", file);
    });
    
    documentTypes.forEach((type, index) => {
      formData.append(`documentTypes[${index}]`, type);
    });

    return this.request("/company/documents/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },

  async getCompanyVerificationStatus() {
    const token = localStorage.getItem("token");
    return this.request("/company/verification-status", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Admin APIs - Company Management
  async getAllCompanies() {
    return this.request("/admin/companies", {
      method: "GET",
    });
  },

  async getCompanyDetailsAdmin(companyId) {
    return this.request(`/admin/companies/${companyId}`, {
      method: "GET",
    });
  },

  async verifyCompany(companyId, adminId, adminNotes = "") {
    return this.request(`/admin/companies/${companyId}/verify`, {
      method: "POST",
      body: { adminId, adminNotes },
    });
  },

  async rejectCompany(companyId, reason, adminNotes = "") {
    return this.request(`/admin/companies/${companyId}/reject`, {
      method: "POST",
      body: { reason, adminNotes },
    });
  },

  async deleteCompanyAdmin(companyId) {
    return this.request(`/admin/companies/${companyId}`, {
      method: "DELETE",
    });
  },

  async createCompany(companyData) {
    return this.request("/admin/companies", {
      method: "POST",
      body: companyData,
    });
  },

  async updateCompany(id, companyData) {
    return this.request(`/admin/companies/${id}`, {
      method: "PUT",
      body: companyData,
    });
  },
};


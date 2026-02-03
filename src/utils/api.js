const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
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
};


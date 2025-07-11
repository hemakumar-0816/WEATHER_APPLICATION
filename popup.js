// Vanilla JavaScript popup implementation
const chrome = window.chrome

class ProductivityTracker {
  constructor() {
    this.timeData = {}
    this.blockedSites = []
    this.isTracking = true
    this.activeTab = "today"
    this.user = null
    this.init()
  }

  async init() {
    await this.loadData()
    await this.loadSettings()
    await this.checkAuth()
    this.render()
    this.setupEventListeners()
  }

  async loadData() {
    try {
      const response = await chrome.runtime.sendMessage({ action: "getTimeData" })
      this.timeData = response || {}
    } catch (error) {
      console.error("Failed to load data:", error)
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(["blockedSites", "isTracking"])
      this.blockedSites = result.blockedSites || []
      this.isTracking = result.isTracking !== false
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  async checkAuth() {
    try {
      const result = await chrome.storage.sync.get(["user"])
      this.user = result.user
    } catch (error) {
      console.error("Failed to check auth:", error)
    }
  }

  formatTime(ms) {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  getTotalTime() {
    return Object.values(this.timeData).reduce((total, time) => total + time, 0)
  }

  async addBlockedSite() {
    const input = document.getElementById("newBlockedSite")
    const site = input.value.trim()

    if (site && !this.blockedSites.includes(site)) {
      this.blockedSites.push(site)
      await chrome.runtime.sendMessage({
        action: "updateBlockedSites",
        sites: this.blockedSites,
      })
      input.value = ""
      this.renderBlockedSites()
    }
  }

  async removeBlockedSite(site) {
    this.blockedSites = this.blockedSites.filter((s) => s !== site)
    await chrome.runtime.sendMessage({
      action: "updateBlockedSites",
      sites: this.blockedSites,
    })
    this.renderBlockedSites()
  }

  async toggleTracking() {
    this.isTracking = !this.isTracking
    await chrome.runtime.sendMessage({
      action: "toggleTracking",
      enabled: this.isTracking,
    })
    this.renderTrackingStatus()
  }

  async login(email, password) {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (data.token) {
        await chrome.storage.sync.set({
          authToken: data.token,
          user: data.user,
        })
        this.user = data.user
        this.render()
      } else {
        this.showError("Login failed: " + (data.message || "Unknown error"))
      }
    } catch (error) {
      this.showError("Login failed: " + error.message)
    }
  }

  async logout() {
    await chrome.storage.sync.remove(["authToken", "user"])
    this.user = null
    this.render()
  }

  showError(message) {
    const errorDiv = document.getElementById("error-message")
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.style.display = "block"
      setTimeout(() => {
        errorDiv.style.display = "none"
      }, 5000)
    }
  }

  switchTab(tab) {
    this.activeTab = tab
    this.renderTabs()
    this.renderTabContent()
  }

  render() {
    const root = document.getElementById("root")

    if (!this.user) {
      root.innerHTML = this.renderLoginForm()
    } else {
      root.innerHTML = this.renderMainApp()
    }

    this.setupEventListeners()
  }

  renderLoginForm() {
    return `
      <div class="login-container" style="padding: 20px;">
        <h2 style="text-align: center; margin-bottom: 20px;">Login to Productivity Tracker</h2>
        <div id="error-message" style="display: none; color: red; margin-bottom: 10px; text-align: center;"></div>
        <form id="loginForm">
          <input type="email" id="email" placeholder="Email" required 
                 style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
          <input type="password" id="password" placeholder="Password" required
                 style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;">
          <button type="submit" style="width: 100%; padding: 10px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Login
          </button>
        </form>
        <p style="text-align: center; margin-top: 15px; font-size: 12px; color: #666;">
          Demo: Use any email/password to login
        </p>
      </div>
    `
  }

  renderMainApp() {
    return `
      <div style="padding: 16px; width: 380px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0;">Productivity Tracker</h1>
          <button id="logoutBtn" style="font-size: 12px; color: #007cba; background: none; border: none; cursor: pointer; text-decoration: underline;">
            Logout
          </button>
        </div>

        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span>Tracking:</span>
            <button id="trackingToggle" style="padding: 4px 12px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px; ${this.isTracking ? "background: #10b981; color: white;" : "background: #d1d5db; color: #374151;"}">
              ${this.isTracking ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <div style="display: flex; border-bottom: 1px solid #e5e7eb;">
            <button class="tab-btn" data-tab="today" style="padding: 8px 16px; border: none; background: none; cursor: pointer; ${this.activeTab === "today" ? "border-bottom: 2px solid #007cba; color: #007cba;" : "color: #6b7280;"}">
              Today
            </button>
            <button class="tab-btn" data-tab="blocked" style="padding: 8px 16px; border: none; background: none; cursor: pointer; ${this.activeTab === "blocked" ? "border-bottom: 2px solid #007cba; color: #007cba;" : "color: #6b7280;"}">
              Blocked
            </button>
            <button class="tab-btn" data-tab="reports" style="padding: 8px 16px; border: none; background: none; cursor: pointer; ${this.activeTab === "reports" ? "border-bottom: 2px solid #007cba; color: #007cba;" : "color: #6b7280;"}">
              Reports
            </button>
          </div>
        </div>

        <div id="tabContent">
          ${this.renderTabContent()}
        </div>
      </div>
    `
  }

  renderTabContent() {
    switch (this.activeTab) {
      case "today":
        return this.renderTodayTab()
      case "blocked":
        return this.renderBlockedTab()
      case "reports":
        return this.renderReportsTab()
      default:
        return this.renderTodayTab()
    }
  }

  renderTodayTab() {
    const totalTime = this.getTotalTime()
    const sortedSites = Object.entries(this.timeData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return `
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Today's Activity (${this.formatTime(totalTime)})</h3>
        <div>
          ${sortedSites
            .map(
              ([site, time]) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${site}</span>
              <span style="font-size: 12px; color: #6b7280;">${this.formatTime(time)}</span>
            </div>
          `,
            )
            .join("")}
          ${sortedSites.length === 0 ? '<p style="text-align: center; color: #6b7280; margin: 20px 0;">No activity tracked today</p>' : ""}
        </div>
      </div>
    `
  }

  renderBlockedTab() {
    return `
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Blocked Sites</h3>
        <div style="display: flex; margin-bottom: 8px;">
          <input type="text" id="newBlockedSite" placeholder="Enter domain (e.g., facebook.com)"
                 style="flex: 1; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px 0 0 4px;">
          <button id="addBlockedSite" style="padding: 6px 12px; background: #007cba; color: white; border: none; border-radius: 0 4px 4px 0; cursor: pointer;">
            Add
          </button>
        </div>
        <div id="blockedSitesList">
          ${this.blockedSites
            .map(
              (site) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span>${site}</span>
              <button class="remove-site" data-site="${site}" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 12px;">
                Remove
              </button>
            </div>
          `,
            )
            .join("")}
          ${this.blockedSites.length === 0 ? '<p style="text-align: center; color: #6b7280; margin: 20px 0;">No blocked sites</p>' : ""}
        </div>
      </div>
    `
  }

  renderReportsTab() {
    return `
      <div>
        <h3 style="font-weight: 600; margin-bottom: 16px;">Weekly Reports</h3>
        <div id="reportsList">
          <p style="text-align: center; color: #6b7280; margin: 20px 0;">Loading reports...</p>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const email = document.getElementById("email").value
        const password = document.getElementById("password").value
        this.login(email, password)
      })
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout())
    }

    // Tracking toggle
    const trackingToggle = document.getElementById("trackingToggle")
    if (trackingToggle) {
      trackingToggle.addEventListener("click", () => this.toggleTracking())
    }

    // Tab buttons
    const tabBtns = document.querySelectorAll(".tab-btn")
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab)
      })
    })

    // Add blocked site
    const addBlockedSite = document.getElementById("addBlockedSite")
    if (addBlockedSite) {
      addBlockedSite.addEventListener("click", () => this.addBlockedSite())
    }

    // Add blocked site on Enter
    const newBlockedSite = document.getElementById("newBlockedSite")
    if (newBlockedSite) {
      newBlockedSite.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.addBlockedSite()
        }
      })
    }

    // Remove blocked site buttons
    const removeBtns = document.querySelectorAll(".remove-site")
    removeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.removeBlockedSite(btn.dataset.site)
      })
    })

    // Load reports if on reports tab
    if (this.activeTab === "reports") {
      this.loadReports()
    }
  }

  renderTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn")
    tabBtns.forEach((btn) => {
      if (btn.dataset.tab === this.activeTab) {
        btn.style.borderBottom = "2px solid #007cba"
        btn.style.color = "#007cba"
      } else {
        btn.style.borderBottom = "none"
        btn.style.color = "#6b7280"
      }
    })
  }

  renderTabContent() {
    const tabContent = document.getElementById("tabContent")
    if (tabContent) {
      tabContent.innerHTML = this.renderTabContent()
      this.setupEventListeners()
    }
  }

  renderTrackingStatus() {
    const trackingToggle = document.getElementById("trackingToggle")
    if (trackingToggle) {
      trackingToggle.textContent = this.isTracking ? "ON" : "OFF"
      trackingToggle.style.background = this.isTracking ? "#10b981" : "#d1d5db"
      trackingToggle.style.color = this.isTracking ? "white" : "#374151"
    }
  }

  renderBlockedSites() {
    const blockedSitesList = document.getElementById("blockedSitesList")
    if (blockedSitesList) {
      blockedSitesList.innerHTML = `
        ${this.blockedSites
          .map(
            (site) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
            <span>${site}</span>
            <button class="remove-site" data-site="${site}" style="color: #ef4444; background: none; border: none; cursor: pointer; font-size: 12px;">
              Remove
            </button>
          </div>
        `,
          )
          .join("")}
        ${this.blockedSites.length === 0 ? '<p style="text-align: center; color: #6b7280; margin: 20px 0;">No blocked sites</p>' : ""}
      `

      // Re-attach event listeners for remove buttons
      const removeBtns = document.querySelectorAll(".remove-site")
      removeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          this.removeBlockedSite(btn.dataset.site)
        })
      })
    }
  }

  async loadReports() {
    try {
      const token = await chrome.storage.sync.get(["authToken"])
      const response = await fetch("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token.authToken}` },
      })
      const reports = await response.json()

      const reportsList = document.getElementById("reportsList")
      if (reportsList) {
        reportsList.innerHTML =
          reports.length > 0
            ? reports
                .map(
                  (report) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
            <div style="font-weight: 500;">Week of ${new Date(report.weekStart).toLocaleDateString()}</div>
            <div style="font-size: 12px; color: #6b7280;">
              Total time: ${Math.floor(report.totalTime / 3600000)}h ${Math.floor((report.totalTime % 3600000) / 60000)}m
            </div>
            <div style="font-size: 12px; color: #6b7280;">Most visited: ${report.topSite}</div>
          </div>
        `,
                )
                .join("")
            : '<p style="text-align: center; color: #6b7280; margin: 20px 0;">No reports available</p>'
      }
    } catch (error) {
      console.error("Failed to load reports:", error)
      const reportsList = document.getElementById("reportsList")
      if (reportsList) {
        reportsList.innerHTML =
          '<p style="text-align: center; color: #ef4444; margin: 20px 0;">Failed to load reports</p>'
      }
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProductivityTracker()
})

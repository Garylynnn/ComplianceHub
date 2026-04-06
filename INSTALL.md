# Installation Guide: Compliance Maker-Checker

This guide explains how to set up the application on a local Virtual Machine (VM).

---

## Option 1: React + Express (The Web App)
Use this if you want to run the standalone web application with the dashboard and forms.

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <your-github-repo-url>
   cd compliance-maker-checker
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   *(Optional: Add your GEMINI_API_KEY if you plan to use AI features later)*

4. **Build and Start**:
   ```bash
   # Build the frontend
   npm run build

   # Start the production server
   npm run start
   ```
   The app will be available at `http://<your-vm-ip>:3000`.

---

## Option 2: Frappe / ERPNext (The Enterprise Version)
Use this if you want to integrate the compliance system into your existing ERPNext environment.

### Prerequisites
- **Frappe Bench** installed and running.
- A site created (e.g., `site1.local`).

### Steps
1. **Create the App**:
   ```bash
   bench new-app compliance_mgmt
   ```

2. **Install the App to your Site**:
   ```bash
   bench --site [your-site-name] install-app compliance_mgmt
   ```

3. **Implement the Logic**:
   Follow the code provided in **`FRAPPE.md`**:
   - Copy the Python code to `compliance_mgmt/compliance_mgmt/doctype/audit_submission/audit_submission.py`.
   - Copy the Client Script to the Frappe Desk (Awesome Bar > Client Script > New).
   - Create the DocTypes (Category, Requirement, Submission, Evidence) using the Desk UI.

4. **Restart Bench**:
   ```bash
   bench restart
   ```

---

## 🌐 Accessing from outside the VM
If you are using a VM (like AWS, Azure, or VirtualBox), ensure the following:
1. **Port 3000** (for React) or **Port 8000** (for Frappe) is open in your VM's security group/firewall.
2. If using VirtualBox, set up **Port Forwarding** in Network Settings.

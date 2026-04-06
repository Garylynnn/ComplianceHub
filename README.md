# Compliance Maker-Checker Application

A professional IT audit management system designed for Maker-Checker workflows. This application helps manage Daily, Weekly, and Monthly compliance audits for categories like User Access Review, Patch Management, Physical Security, and more.

## 🚀 Features
- **Maker-Checker Workflow**: Strict separation of duties between auditors and reviewers.
- **Dynamic Audit Forms**: Requirements load automatically based on the selected category.
- **Real-time Dashboard**: Visualize audit status and compliance trends.
- **Multi-Role Support**: Toggle between Maker and Checker views for simulation.

---

## 💻 Local VM Deployment Instructions

Follow these steps to deploy the application on a local Virtual Machine (Ubuntu/Debian recommended).

### 1. Prerequisites
Ensure your VM has the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Nginx** (for reverse proxy)
- **PM2** (for process management)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -y pm2 -g
```

### 2. Clone and Install
```bash
# Clone the repository
git clone <your-repo-url>
cd compliance-maker-checker

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your specific configurations
nano .env
```

### 4. Build for Production
```bash
npm run build
```

### 5. Serve the Application
You can serve the application using a simple static server or Nginx.

#### Option A: Using PM2 and a static server
```bash
# Install a simple server
sudo npm install -g serve

# Start the app with PM2
pm2 start "serve -s dist -p 3000" --name "compliance-app"

# Save PM2 list for auto-restart
pm2 save
pm2 startup
```

#### Option B: Using Nginx (Recommended)
Configure Nginx to serve the `dist` folder:
```bash
sudo nano /etc/nginx/sites-available/compliance-app
```
Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_vm_ip_or_domain;

    location / {
        root /path/to/compliance-maker-checker/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/compliance-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🛠️ Frappe/ERPNext Implementation
If you intend to implement this within an existing **Frappe/ERPNext** environment, please refer to the [FRAPPE.md](./FRAPPE.md) file for:
- DocType Schema (JSON)
- Python Controllers
- Client Scripts
- Bench commands

---

## 🧪 Development
To run the app locally in development mode:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

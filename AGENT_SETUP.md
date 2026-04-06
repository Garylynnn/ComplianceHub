# AI Agent Setup Guide: Compliance DevOps

This guide explains how to set up an AI agent in your local VM to automate documentation, testing, and GitHub updates.

---

## 🤖 Recommended Tool: Aider
[Aider](https://aider.chat/) is a CLI tool that lets you edit code and manage Git using AI. It is perfect for "keeping the app updated in GitHub."

### 1. Install Aider in your VM
```bash
# Install using pip
pip install aider-chat

# Or using homebrew/npm if preferred
```

### 2. Configure API Key
Aider works best with Gemini 1.5 Pro or Flash.
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### 3. Run Aider
Navigate to your project folder and start the agent:
```bash
aider --model gemini/gemini-1.5-pro
```
**What you can ask Aider:**
- "Update the documentation in INSTALL.md to include the new VC check category."
- "Run npm test and fix any failing compliance logic."
- "Commit these changes with a descriptive message and push to main."

---

## 🛠️ Automated Testing Script
I have created a `scripts/test-compliance.sh` file. Your AI agent can run this to verify the app before pushing to GitHub.

```bash
chmod +x scripts/test-compliance.sh
./scripts/test-compliance.sh
```

---

## 🐙 GitHub Automation (SSH Setup)
To allow your AI agent to push updates automatically, you must set up an SSH key in your VM:

1. **Generate Key**: `ssh-keygen -t ed25519 -C "agent@yourvm.com"`
2. **Add to GitHub**: Copy the output of `cat ~/.ssh/id_ed25519.pub` to your GitHub Account Settings > SSH Keys.
3. **Test Connection**: `ssh -T git@github.com`

---

## 🧠 Custom Maintenance Agent (Node.js)
I have added a script at `scripts/maintenance.ts` that uses your **GEMINI_API_KEY**. You can run this to generate weekly compliance reports or audit summaries.

**Run it via:**
```bash
npx tsx scripts/maintenance.ts --task "Summarize this week's audit gaps"
```

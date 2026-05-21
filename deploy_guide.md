# SME PNG Online Market - Deployment Guide

Since this is a Next.js application, the official and easiest way to put it online for free is using **Vercel**. 

Here is the step-by-step guide to get your marketplace live on the internet:

---

## 🚀 Option 1: Direct Command Line Deployment (easiest without Git)

Since Git is not currently configured on your system, you can deploy directly from your local terminal using the Vercel CLI via `npx`:

1. Open your terminal or Command Prompt.
2. Ensure you are in the project folder:
   ```bash
   cd "c:\Users\brend\OneDrive\Desktop\SME PNG Online Market"
   ```
3. Run the following command:
   ```bash
   npx vercel
   ```
4. **Follow the terminal prompts:**
   - **Log in:** If it's your first time, it will ask you to log in (select GitHub, Google, or Email).
   - **Set up project:** Type `Y` to set up and deploy.
   - **Which scope?** Press `Enter` (selects your default account).
   - **Link to existing project?** Type `N` (since this is a new project).
   - **What is your project name?** Press `Enter` to use `sme-market` or type a custom name.
   - **In which directory is your code located?** Press `Enter` (defaults to `./`).
   - **Want to modify settings?** Type `N` (it will auto-detect Next.js and use the optimal settings).

Vercel will now upload your files, build the application online, and provide you with a **Live URL** (e.g. `https://sme-market.vercel.app`)!

---

## 🔄 Option 2: Connecting to GitHub (Recommended for updates)

If you plan to make continuous updates and want it to redeploy automatically every time you save changes:

1. Install **Git** on your computer ([Download here](https://git-scm.com/)).
2. Create a repository on [GitHub](https://github.com/).
3. Initialize git and push the project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```
4. Log into [Vercel](https://vercel.com/) with your web browser, click **"Add New"** > **"Project"**, and select your GitHub repository to import it.

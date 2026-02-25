<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=Yann%20Home&fontSize=70&animation=fadeIn&fontAlignY=35&desc=Next-Generation%20Web%20Experience&descAlignY=55&descAlign=50" alt="Yann Home Banner"/>

  <br />

  <h1>🚀 Yann Home Website 🚀</h1>

  <p>
    <strong>A modern, high-performance web application built with Next.js 15, tailored for seamless user experiences, premium UI, and robust backend integrations.</strong>
  </p>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-Explore-blue?style=for-the-badge&logo=compass"/></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Tech_Stack-View-green?style=for-the-badge&logo=stackexchange"/></a>
    <a href="#installation"><img src="https://img.shields.io/badge/Installation-Guide-orange?style=for-the-badge&logo=rocket"/></a>
  </p>

  <img src="https://raw.githubusercontent.com/MartinHeinz/MartinHeinz/master/wave.gif" width="30px">
</div>

---

## ✨ Features

🔥 **Next-Gen Framework:** Powered by Next.js 15 with Turbopack for blazing-fast development and optimized SEO.
🔐 **Secure Authentication:** Robust user authentication utilizing JWT and `bcryptjs`.
💳 **Payments & Commerce:** Seamless transaction processing integrated with Razorpay gateway.
📧 **Automated Mailing:** Reliable and dynamic email system powered by `nodemailer`.
🖼️ **Advanced Image Handling:** Interactive image cropping capabilities using `react-easy-crop`.
🗄️ **Database Architecture:** Scalable NoSQL database management via Mongoose and MongoDB.
🎨 **Stunning UI/UX:** Beautifully crafted, responsive interfaces designed with TailwindCSS v4 & Lucide React.
📈 **Real-time Analytics:** Application speed insights and error tracking handled by Vercel Analytics and Sentry.

---

## 💻 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <br />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF" />
  <br/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
</div>

---

## 🚀 Getting Started

Follow these quick steps to get the project up and running seamlessly on your local machine.

### Prerequisites

Ensure you have the following installed before proceeding:
- **Node.js** (v18+ recommended)
- **npm**, **yarn**, or **pnpm**
- A running instance of **MongoDB** and **Redis** (if heavily used locally)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Yann Website"
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory to store your keys. Use the provided example as a template:
   ```bash
   cp .env.example .env.local
   ```
   *(Ensure you update the database URIs, Razorpay keys, JWT secrets, and other credentials inside `.env.local`)*

4. **Fire up the development server!** ⚡
   ```bash
   npm run dev
   ```
   Head over to `http://localhost:3000` in your browser to see the magic happen!

---

## 📂 Project Structure

```text
📂 Yann Website
 ├── 📁 public         # Static assets (images, icons, etc.)
 ├── 📁 src            
 │   ├── 📁 app        # Next.js 15 App Router pages & API routes
 │   ├── 📁 components # Reusable UI components
 │   └── 📁 ...        # Utils, Hooks, Lib configs
 ├── 📁 scripts        # Utility automation and build scripts
 ├── 📄 next.config.mjs# Next.js configuration
 ├── 📄 tailwindcss    # Styles configuration
 └── 📄 package.json   # Dependencies and script definitions
```

---

## 🛠️ Available Commands

In the project directory, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Starts the local dev server using Next.js Turbopack |
| `npm run build` | Compiles the application for production deployment |
| `npm run start` | Spins up the production server locally |
| `npm run lint` | Scans for styling and syntax violations via ESLint |

---

<div align="center">
  <h3>Happy Coding! 💻✨</h3>
  <img src="https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif" alt="Coding GIF" width="400" style="border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"/>
  <br/><br/>
  <i>Crafted with ❤️ for the Yann Home Ecosystem</i>
</div>

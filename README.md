<p align="center">
  <img src="Images/logo.png" alt="DevMinds Logo" width="150"/>
</p>

<h1 align="center">🚀 DevMinds</h1>

<p align="center">
  <strong>A powerful platform to solve problems, visualize algorithms, and grow as a developer.</strong><br/>
  Empowering students and mentors through coding, collaboration, and innovation.
</p>

---
<table>
  <tr>
    <td width="50%" valign="top">
      <h2>🌟 Key Features</h2>
      <ul>
        <li>🧠 <strong>Algorithm Visualizer</strong><br/>Step-by-step visual explanations of popular algorithms.</li><br/>
        <li>🐍 <strong>Python Online Judge</strong><br/>Solve coding problems with real-time evaluation.</li><br/>
        <li>💻 <strong>Live Code Compiler</strong><br/>Run HTML, CSS, and JS instantly in the browser.</li><br/>
        <li>🌐 <strong>Developer Community</strong><br/>Post, comment, and discuss with fellow students.</li><br/>
        <li>🔐 <strong>JWT Role-based Auth</strong><br/>Secure login system for students and mentors.</li>
      </ul>
    </td>
    <td width="50%">
      <img src="Images/appHome.png" alt="DevMinds App Homepage" width="100%" />
    </td>
  </tr>
</table>


---


# 🖥️ Tech Stack

## 🚀 Frontend

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/React Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white" alt="Redux" />
  <img src="https://img.shields.io/badge/Tailwind CSS-0EA5E9?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Material UI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI" />
  <img src="https://img.shields.io/badge/CodeMirror-051C2C?style=for-the-badge&logo=codemirror&logoColor=white" alt="CodeMirror" />
</p>

## 🛠️ Backend

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/bcrypt.js-F4B400?style=for-the-badge&logo=lock&logoColor=black" alt="bcrypt.js" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

---

<!-- ## 📌 Features in Detail

Explore each core feature of **DevMinds** with dedicated visuals and descriptions that showcase its functionality and impact.


## 🧠 Algorithm Visualizer

<table>
  <tr>
    <td width="50%">
      <img src="Images/algovis-1.png" alt="Algorithm Visualizer UI 1" width="100%" />
    </td>
    <td width="50%">
      <img src="Images/algovis-2.png" alt="Algorithm Visualizer UI 2" width="100%" />
    </td>
  </tr>
</table>

Visualize how sorting, searching, and graph algorithms work with real-time animations. Understand core concepts through interactive explanations.

---

## 🐍 Python Online Judge

<table>
  <tr>
    <td width="50%">
      <img src="Images/judge-1.png" alt="Online Judge Code View" width="100%" />
    </td>
    <td width="50%">
      <img src="Images/judge-2.png" alt="Submission Result View" width="100%" />
    </td>
  </tr>
</table>

Solve a wide range of coding problems in Python and get instant feedback, run-time analysis, and leaderboard tracking.

---

## 💻 Live Code Compiler

<table>
  <tr>
    <td width="50%">
      <img src="Images/compiler-1.png" alt="Live Compiler HTML" width="100%" />
    </td>
    <td width="50%">
      <img src="Images/compiler-2.png" alt="Live Compiler Output" width="100%" />
    </td>
  </tr>
</table>

Write and test HTML, CSS, and JavaScript code instantly inside your browser. Great for prototyping and frontend learning.

---

## 🌐 Developer Community

<table>
  <tr>
    <td width="50%">
      <img src="Images/community-1.png" alt="Community Posts" width="100%" />
    </td>
    <td width="50%">
      <img src="Images/community-2.png" alt="Comment Section" width="100%" />
    </td>
  </tr>
</table>

Post questions, share your learning journey, comment on others' projects, and grow together with a peer-driven dev community.

---

## 🔐 JWT Role-based Authentication

<table>
  <tr>
    <td width="50%">
      <img src="Images/auth-1.png" alt="Student Login" width="100%" />
    </td>
    <td width="50%">
      <img src="Images/auth-2.png" alt="Mentor Panel" width="100%" />
    </td>
  </tr>
</table>

Secure authentication system with role-based access. Mentors can create content, review students, and moderate the platform.

--- -->
## 🛠️ How to Run DevMinds Locally

### 🔧 Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Git](https://git-scm.com/)


### 📦 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/DevMinds.git
cd DevMinds
```
#### 2. Install Dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install 
```
### 🔐 Setup Environment Variables

#### 📂 `client/.env`

```env
VITE_API_URL=http://localhost:5000
```
#### 📂 `server/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devminds
JWT_SECRET=your_jwt_secret
```


### 🚀 Running the App

Open two terminals and run:

#### 🖥️ Terminal 1: Start Backend

```bash
cd server
npm run dev
```
#### 🖥️ Terminal 2: Start Frontend

```bash
cd client
npm run dev
```


### ✅ Ready to Go!

Visit your app at:

- 🔗 Frontend: [http://localhost:5173](http://localhost:5173)
- 🔗 Backend: [http://localhost:5000](http://localhost:5000)

---

### 📬 Contact

Feel free to reach out for questions, collaborations, or feedback:

- 📧 Email: [singladhruv301@gmail.com](mailto:your.email@example.com)  
- 💼 LinkedIn: [https://www.linkedin.com/in/dhruv-singla30/](https://www.linkedin.com/in/your-username)


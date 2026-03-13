<h1 align="center">🚨 Alertify – Incident Management System</h1>

<p align="center">
<img src="https://img.shields.io/badge/Frontend-React-blue">
<img src="https://img.shields.io/badge/Backend-Node.js-green">
<img src="https://img.shields.io/badge/Database-MySQL-orange">
<img src="https://img.shields.io/badge/DevOps-Docker-blue">
<img src="https://img.shields.io/badge/CI/CD-Jenkins-red">
<img src="https://img.shields.io/badge/Cloud-AWS-yellow">
</p>

<hr>

<h2>📌 Project Overview</h2>
<p>
<b>Alertify</b> is a web-based incident management platform designed for organizations to 
track, manage, and resolve technical or operational issues efficiently.
</p>

<p>
Employees can report incidents through the system, while administrators assign them 
to the appropriate teams such as <b>Development, HR, or QA</b>. Assigned team members 
update the progress and provide comments until the issue is fully resolved.
</p>

<hr>

<h2>✨ Key Features</h2>
<ul>
<li>🔐 JWT-based secure authentication</li>
<li>👥 Role-based access control (Admin / Employee)</li>
<li>📢 Incident reporting system</li>
<li>📌 Admin assigns incidents to departments or teams</li>
<li>📊 Task status tracking (To Do / In Progress / Done)</li>
<li>💬 Progress updates and comments</li>
<li>📄 Export incident comments as PDF</li>
<li>🔑 Password reset with verification code</li>
<li>🏢 Department-based task assignment (Development, HR, QA)</li>
</ul>

<hr>

<h2>🛠 Technology Stack</h2>

<h3>Frontend</h3>
<ul>
<li>React</li>
</ul>

<h3>Backend</h3>
<ul>
<li>Node.js</li>
<li>Express.js</li>
</ul>

<h3>Database</h3>
<ul>
<li>MySQL</li>
</ul>

<h3>DevOps & Deployment</h3>
<ul>
<li>Docker (Containerization)</li>
<li>GitHub Actions (Continuous Integration)</li>
<li>Jenkins (Continuous Deployment)</li>
<li>Ansible (Configuration Management)</li>
<li>Terraform (Infrastructure as Code)</li>
<li>AWS EC2 (Cloud Deployment)</li>
</ul>

<hr>

<h2>📈 CI/CD Pipeline Architecture</h2>
<pre>
Developer pushes code to GitHub
          ↓
GitHub Actions runs CI pipeline
          ↓
Jenkins triggers CD pipeline
          ↓
Terraform provisions AWS infrastructure
          ↓
Ansible configures the server
          ↓
Docker containers deploy the application
</pre>

<p align="center">
<!-- You can replace the src with your architecture diagram image -->
<img src="screenshots/ci-cd-architecture.png" alt="CI/CD Architecture Diagram" width="600">
</p>

<hr>

<h2>📷 Screenshots</h2>
<p>Add screenshots of key pages here for clarity:</p>
<ul>
<li>Login Page</li>
<li>Dashboard</li>
<li>Incident Creation</li>
<li>Admin Assignment Panel</li>
<li>Progress Tracking Page</li>
</ul>

<p align="center">
<img src="screenshots/dashboard.png" alt="Dashboard Screenshot" width="400">
<img src="screenshots/incident-page.png" alt="Incident Page Screenshot" width="400">
</p>

<hr>

<h2>⚙️ Running the Project Locally</h2>
<pre>
git clone https://github.com/HiruniWijendrasinhe/DevOPs_Web
cd DevOPs_Web
docker-compose up --build
</pre>

<p>
Then open: <b>http://localhost:3000</b>
</p>

<hr>

<h2>👩‍💻 Author</h2>
<p>
<b>Hiruni Lakshika</b><br>
Computer Engineering Undergraduate<br>
</p>

<h2>📄 License</h2>
<p>MIT License</p>

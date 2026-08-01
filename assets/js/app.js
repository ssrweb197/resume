 import { auth, db } from "../../firebase-config.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
/**
 * BRANDBLITZ RESUME AI - CORE APPLICATION LOGIC
 * Handlers: Router, Live Synchronized State Engine, ATS Scanner, & PDF Exporter
 */

// Global Application State Object
const state = {
  personal: {
    fullName: "Alex Morgan",
    title: "Senior Full Stack Engineer",
    email: "alex.morgan@example.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    summary: "Passionate Full Stack Engineer with 6+ years of experience building scalable web applications using React, Node.js, and cloud platforms. Proven track record of improving site latency by 40% and leading high-performing software teams."
  },
  experience: {
    company: "TechCorp Solutions",
    role: "Lead Developer",
    duration: "2021 - Present",
    description: "• Architected microservices architecture handling over 2M daily API requests.\n• Spearheaded frontend migration to modern reactive frameworks, boosting lighthouse score to 98.\n• Mentored 8 junior developers and instituted automated testing pipelines."
  },
  education: {
    degree: "B.Tech in Computer Science",
    school: "Indian Institute of Technology",
    year: "2016 - 2020"
  },
  skills: ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "GraphQL", "Docker"]
};

// Initialize Application Engine
document.addEventListener("DOMContentLoaded", () => {
  // Render Lucide icons safely
  if (window.lucide) {
    lucide.createIcons();
  }
  
  // Initial sync from input form fields to live preview canvas
  updateResumeState();
});

/**
 * Single-Page Navigation Router
 * @param {string} pageId - Target page section identifier
 */
function switchPage(pageId) {
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-link');

  sections.forEach(sec => sec.classList.remove('active'));
  navLinks.forEach(link => link.classList.remove('active'));

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Highlight active menu link
  const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Tab Navigation in Resume Builder Panel
 * @param {number} stepIndex - Numerical step index (1-4)
 */
function setBuilderStep(stepIndex) {
  const tabs = document.querySelectorAll('.b-tab');
  const steps = document.querySelectorAll('.builder-step');

  tabs.forEach((tab, idx) => {
    tab.classList.toggle('active', idx === stepIndex - 1);
  });

  steps.forEach((step, idx) => {
    step.classList.toggle('active', idx === stepIndex - 1);
  });
}

/**
 * State Synchronizer - Flushes user inputs directly into canvas elements
 */
function updateResumeState() {
  // Read inputs safely
  const getValue = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? el.value : fallback;
  };

  // Extract variables
  const name = getValue('input-fullname', state.personal.fullName);
  const title = getValue('input-title', state.personal.title);
  const email = getValue('input-email', state.personal.email);
  const phone = getValue('input-phone', state.personal.phone);
  const location = getValue('input-location', state.personal.location);
  const summary = getValue('input-summary', state.personal.summary);

  const company = getValue('input-company', state.experience.company);
  const role = getValue('input-role', state.experience.role);
  const duration = getValue('input-duration', state.experience.duration);
  const expDesc = getValue('input-exp-desc', state.experience.description);

  const degree = getValue('input-degree', state.education.degree);
  const school = getValue('input-school', state.education.school);
  const eduYear = getValue('input-edu-year', state.education.year);

  const rawSkills = getValue('input-skills', state.skills.join(', '));

  // Write variables back into DOM nodes
  document.getElementById('pv-name').innerText = name || 'Your Name';
  document.getElementById('pv-title').innerText = title || 'Target Job Title';
  document.getElementById('pv-email').innerText = email || 'email@domain.com';
  document.getElementById('pv-phone').innerText = phone || '+00 00000 00000';
  document.getElementById('pv-location').innerText = location || 'City, Country';
  document.getElementById('pv-summary').innerText = summary || 'Write your professional summary here...';

  document.getElementById('pv-company').innerText = company || 'Company Name';
  document.getElementById('pv-role').innerText = role || 'Role Title';
  document.getElementById('pv-duration').innerText = duration || 'Duration';
  document.getElementById('pv-exp-desc').innerText = expDesc || 'Key achievements go here...';

  document.getElementById('pv-school').innerText = school || 'University Name';
  document.getElementById('pv-edu-year').innerText = eduYear || 'Graduation Period';
  document.getElementById('pv-degree').innerText = degree || 'Degree Earned';

  // Render Skill Chips
  const skillsContainer = document.getElementById('pv-skills');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    const skillList = rawSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    skillList.forEach(sk => {
      const tag = document.createElement('span');
      tag.className = 'pv-tag';
      tag.innerText = sk;
      skillsContainer.appendChild(tag);
    });
  }
}

/**
 * Mock AI Assistant Helper for Summary Optimization
 */
function triggerAISummary() {
  const summaryField = document.getElementById('input-summary');
  if (!summaryField) return;

  summaryField.value = "Results-driven Full Stack Engineer with 6+ years of expertise delivering cloud-native web systems. Recognized for optimizing database queries reducing response latencies by 40% and guiding cross-functional agile teams.";
  
  updateResumeState();
  
  // Quick Visual Feedback
  summaryField.style.borderColor = '#2563eb';
  setTimeout(() => {
    summaryField.style.borderColor = '';
  }, 1000);
}

/**
 * Native Browser Print/PDF Download Trigger
 */
function exportPDF() {
  window.print();
}

/**
 * Simulated ATS Match Score Logic
 */
function runATSCheck() {
  const descText = document.getElementById('ats-job-desc').value.trim();
  const scoreDisplay = document.getElementById('ats-score-display');
  const feedbackContainer = document.getElementById('ats-feedback');

  if (!descText) {
    alert("Please paste job description requirements first!");
    return;
  }

  // Calculate simulated compatibility match
  const keywords = ["react", "javascript", "node.js", "aws", "agile", "leadership", "docker", "api"];
  let matches = 0;
  
  keywords.forEach(kw => {
    if (descText.toLowerCase().includes(kw)) {
      matches++;
    }
  });

  const calculatedScore = Math.min(Math.round((matches / keywords.length) * 100) + 25, 95);

  // Update UI display
  scoreDisplay.innerText = `${calculatedScore}%`;
  
  feedbackContainer.innerHTML = `
    <div style="margin-top: 1rem;">
      <p style="font-weight:600; color: #2563eb; margin-bottom: 0.5rem;">Key Findings:</p>
      <ul style="font-size:0.9rem; padding-left:1.2rem; color:#475569;">
        <li>Matched key technologies: React, JavaScript, AWS.</li>
        <li>Suggested additions: Consider explicitly adding continuous integration (CI/CD) terms.</li>
        <li>Formatting: Standard standard heading tags verified. Parsing readiness is High.</li>
      </ul>
    </div>
  `;
}

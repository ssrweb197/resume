/**
 * BRANDBLITZ RESUME AI - CORE APPLICATION LOGIC
 * Client-side resume preview, navigation, PDF printing and transparent keyword comparison.
 * No sample candidate data or simulated AI/ATS claims are inserted.
 */

const emptyResume = {
  personal: { fullName: "", title: "", email: "", phone: "", location: "", summary: "" },
  experience: { company: "", role: "", duration: "", description: "" },
  education: { degree: "", school: "", year: "" },
  skills: []
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
  updateResumeState();

  const menuButton = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const opened = navLinks.classList.toggle("mobile-open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("mobile-open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }
});

function switchPage(pageId) {
  const target = document.getElementById(`page-${pageId}`);
  if (!target) return false;
  document.querySelectorAll(".page-section").forEach(section => {
    section.classList.toggle("active", section === target);
  });
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${pageId}`);
  });
  document.getElementById("navLinks")?.classList.remove("mobile-open");
  if (window.history?.replaceState) window.history.replaceState(null, "", `#${pageId}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  return false;
}

function setBuilderStep(stepIndex) {
  document.querySelectorAll(".b-tab").forEach((tab, index) => {
    tab.classList.toggle("active", index === stepIndex - 1);
  });
  document.querySelectorAll(".builder-step").forEach((step, index) => {
    step.classList.toggle("active", index === stepIndex - 1);
  });
}

function fieldValue(id) {
  return document.getElementById(id)?.value?.trim() || "";
}

function setText(id, value, placeholder) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || placeholder;
}

function updateResumeState() {
  setText("pv-name", fieldValue("input-fullname"), "Your Name");
  setText("pv-title", fieldValue("input-title"), "Your Professional Title");
  setText("pv-email", fieldValue("input-email"), "");
  setText("pv-phone", fieldValue("input-phone"), "");
  setText("pv-location", fieldValue("input-location"), "");
  setText("pv-summary", fieldValue("input-summary"), "");
  setText("pv-company", fieldValue("input-company"), "");
  setText("pv-role", fieldValue("input-role"), "");
  setText("pv-duration", fieldValue("input-duration"), "");
  setText("pv-exp-desc", fieldValue("input-exp-desc"), "");
  setText("pv-school", fieldValue("input-school"), "");
  setText("pv-edu-year", fieldValue("input-edu-year"), "");
  setText("pv-degree", fieldValue("input-degree"), "");

  const skillsContainer = document.getElementById("pv-skills");
  if (skillsContainer) {
    skillsContainer.replaceChildren();
    fieldValue("input-skills").split(",").map(skill => skill.trim()).filter(Boolean).forEach(skill => {
      const tag = document.createElement("span");
      tag.className = "pv-tag";
      tag.textContent = skill;
      skillsContainer.appendChild(tag);
    });
  }
}

// AI writing is not connected to an AI service yet; do not fabricate generated content.
function triggerAISummary() {
  window.alert("AI writing assistance is not connected yet. Please write or paste your own professional summary for now.");
}

function exportPDF() {
  const name = fieldValue("input-fullname");
  if (!name) {
    window.alert("Please enter your name before exporting your resume.");
    document.getElementById("input-fullname")?.focus();
    return;
  }
  window.print();
}

function runATSCheck() {
  const jobText = fieldValue("ats-job-desc");
  const scoreDisplay = document.getElementById("ats-score-display");
  const feedback = document.getElementById("ats-feedback");
  if (!jobText) {
    window.alert("Please paste the target job description first.");
    return;
  }
  if (!scoreDisplay || !feedback) return;

  const resumeText = [
    fieldValue("input-fullname"), fieldValue("input-title"), fieldValue("input-summary"),
    fieldValue("input-company"), fieldValue("input-role"), fieldValue("input-exp-desc"),
    fieldValue("input-degree"), fieldValue("input-school"), fieldValue("input-skills")
  ].join(" ").toLowerCase();

  const stopWords = new Set(("the and for with you your our are was were this that from have has had will can all any not but job role work team skills experience ability required preferred responsibilities qualifications about into using use used their they them who what when where how also more less than then such other including").split(" "));
  const terms = (jobText.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []);
  const uniqueTerms = [...new Set(terms.filter(term => !stopWords.has(term) && !/^\\d+$/.test(term)))];
  if (!uniqueTerms.length) {
    feedback.textContent = "The job description does not contain enough readable keywords to compare.";
    scoreDisplay.textContent = "—";
    return;
  }

  const matched = uniqueTerms.filter(term => resumeText.includes(term));
  const missing = uniqueTerms.filter(term => !resumeText.includes(term));
  const score = Math.round((matched.length / uniqueTerms.length) * 100);
  scoreDisplay.textContent = `${score}%`;
  feedback.replaceChildren();

  const note = document.createElement("p");
  note.textContent = `Keyword overlap: ${matched.length} of ${uniqueTerms.length} unique job-description terms were found in the resume fields.`;
  feedback.appendChild(note);

  const addList = (heading, items) => {
    const title = document.createElement("p");
    title.style.cssText = "font-weight:600;color:#2563eb;margin:.8rem 0 .3rem";
    title.textContent = heading;
    feedback.appendChild(title);
    const list = document.createElement("ul");
    list.style.cssText = "font-size:.9rem;padding-left:1.2rem;color:#475569";
    (items.length ? items.slice(0, 18) : ["None identified"]).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    feedback.appendChild(list);
  };
  addList("Matched terms", matched);
  addList("Terms to consider adding only if they truthfully describe your experience", missing);
  const disclaimer = document.createElement("p");
  disclaimer.style.cssText = "font-size:.78rem;color:#64748b;margin-top:.8rem";
  disclaimer.textContent = "This is a basic keyword-overlap check, not a real ATS system, hiring prediction, grammar audit, or guarantee of an interview. Review every suggested term for accuracy.";
  feedback.appendChild(disclaimer);
}

window.switchPage = switchPage;
window.setBuilderStep = setBuilderStep;
window.updateResumeState = updateResumeState;
window.triggerAISummary = triggerAISummary;
window.exportPDF = exportPDF;
window.runATSCheck = runATSCheck;

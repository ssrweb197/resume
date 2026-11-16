/**
 * BrandBlitz Resume AI
 * Browser-side resume text extraction and transparent resume checklist.
 * Uploaded files are processed locally in the visitor's browser and are not sent to a server.
 */
let uploadedResumeText = "";
let uploadedResumeName = "";

let builderUploadMode = false;
function startNewResume() {
  builderUploadMode = false;
  switchPage("builder");
  setBuilderStep(1);
}
function startBuilderUpload() {
  builderUploadMode = true;
  const status = document.getElementById("builderUploadStatus");
  if (status) status.textContent = "Choose your PDF, DOCX or TXT resume (maximum 8 MB).";
  document.getElementById("resumeUpload")?.click();
}
function extractResumeSection(text, headings) {
  const heading = headings.join("|");
  const pattern = new RegExp("(?:^|\\n)\\s*(?:" + heading + ")\\s*[:\\-]?\\s*([\\s\\S]*?)(?=\\n\\s*(?:professional summary|summary|profile|objective|work experience|experience|employment|work history|education|academic|skills|technical skills|projects|certifications|achievements|languages|interests|references)\\s*[:\\-]?\\s*(?:\\n|$)|$)", "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}
function importResumeIntoBuilder(text) {
  const ids = ["input-fullname","input-title","input-email","input-phone","input-location","input-summary","input-company","input-role","input-duration","input-exp-desc","input-degree","input-school","input-edu-year","input-skills","input-projects","input-achievements","input-links"];
  const hasExisting = ids.some(id => (document.getElementById(id)?.value || "").trim());
  if (hasExisting && !window.confirm("Importing this resume will replace the current builder fields. Continue?")) return false;
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const headingOnly = /^(professional summary|summary|profile|objective|work experience|experience|employment|work history|education|academic background|skills|technical skills|projects|certifications|achievements|languages|references|contact|personal details)$/i;
  const firstLine = lines.find(line => !headingOnly.test(line) && !/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(line) && !/^https?:\/\//i.test(line)) || "";
  const email = (text.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i) || [])[0] || "";
  const phone = (text.match(/(?:\+?\d[\d\s().-]{7,}\d)/) || [])[0] || "";
  const summary = extractResumeSection(text, ["professional summary","summary","profile","objective"]);
  const experience = extractResumeSection(text, ["work experience","experience","employment","work history"]);
  const education = extractResumeSection(text, ["education","academic background"]);
  const skills = extractResumeSection(text, ["technical skills","skills","core competencies"]);
  const projects = extractResumeSection(text, ["projects","project experience"]);
  const achievements = extractResumeSection(text, ["certifications","achievements","awards"]);
  const values = {
    "input-fullname": firstLine, "input-email": email, "input-phone": phone,
    "input-summary": summary, "input-exp-desc": experience, "input-school": education,
    "input-skills": skills ? skills.split(/[\n,;•|]+/).map(x => x.trim()).filter(Boolean).join(", ") : "",
    "input-projects": projects, "input-achievements": achievements
  };
  let imported = 0;
  Object.entries(values).forEach(([id,value]) => {
    const field = document.getElementById(id);
    if (field && value) { field.value = value; imported++; }
  });
  updateResumeState();
  const status = document.getElementById("builderUploadStatus");
  if (status) status.textContent = imported
    ? "Resume imported. Please review and complete any empty fields, then choose one of the 15 templates."
    : "The file was read, but details could not be confidently mapped. Please enter them manually.";
  return true;
}


document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
  updateResumeState();
  restoreResumeDraft();
  updateResumeState();
  renderCustomResumeSections();
  selectResumeTemplate(localStorage.getItem("resumebuild-template") || "modern");

  const menuButton = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const opened = navLinks.classList.toggle("mobile-open");
      menuButton.setAttribute("aria-expanded", String(opened));
    });
    navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      navLinks.classList.remove("mobile-open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  const upload = document.getElementById("resumeUpload");
  const drop = document.getElementById("resumeDropZone");
  if (upload) upload.addEventListener("change", event => handleResumeFile(event.target.files?.[0]));
  if (drop) {
    ["dragenter", "dragover"].forEach(type => drop.addEventListener(type, event => {
      event.preventDefault(); drop.classList.add("drag-active");
    }));
    ["dragleave", "drop"].forEach(type => drop.addEventListener(type, event => {
      event.preventDefault(); drop.classList.remove("drag-active");
    }));
    drop.addEventListener("drop", event => handleResumeFile(event.dataTransfer?.files?.[0]));
    drop.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); upload?.click(); }
    });
  }
});

function switchPage(pageId) {
  const target = document.getElementById(`page-${pageId}`);
  if (!target) return false;
  document.querySelectorAll(".page-section").forEach(section => section.classList.toggle("active", section === target));
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${pageId}`));
  document.getElementById("navLinks")?.classList.remove("mobile-open");
  if (window.history?.replaceState) window.history.replaceState(null, "", `#${pageId}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  return false;
}

let selectedResumeTemplate = "modern";
window.selectedResumeTemplate = selectedResumeTemplate;
function selectResumeTemplate(template) {
  const allowed = ["modern", "classic", "minimal", "executive", "fresher", "classic-gold", "professional-navy", "minimal-split", "corporate", "elegant", "pro", "gravity", "timeline", "creative", "compact"];
  if (!allowed.includes(template)) return;
  selectedResumeTemplate = template;
  window.selectedResumeTemplate = template;
  try { localStorage.setItem("resumebuild-template", template); } catch (error) {}
  const paper = document.getElementById("resume-paper");
  if (paper) {
    allowed.forEach(name => paper.classList.remove("resume-template-" + name));
    paper.classList.add("resume-template-" + template);
  }
  document.querySelectorAll(".template-choice").forEach(button => {
    const active = button.dataset.template === template;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setBuilderStep(stepIndex) {
  document.querySelectorAll(".workflow-step").forEach((button,index)=>button.classList.toggle("active",index===0));
  document.querySelectorAll(".b-tab").forEach((tab, index) => tab.classList.toggle("active", index === stepIndex - 1));
  document.querySelectorAll(".builder-step").forEach((step, index) => step.classList.toggle("active", index === stepIndex - 1));
}
function fieldValue(id) { return document.getElementById(id)?.value?.trim() || ""; }
function setText(id, value, placeholder) {
  const node = document.getElementById(id);
  if (node) node.textContent = value || placeholder;
}
const RESUME_DRAFT_KEY = "resumebuild-draft-v1";
const RESUME_FIELD_IDS = ["input-fullname","input-title","input-email","input-phone","input-location","input-summary","input-company","input-role","input-duration","input-exp-desc","input-degree","input-school","input-edu-year","input-skills","input-projects","input-achievements","input-links"];
function restoreResumeDraft() {
  try { const saved = JSON.parse(localStorage.getItem(RESUME_DRAFT_KEY) || "{}"); RESUME_FIELD_IDS.forEach(id => { const field=document.getElementById(id); if(field && typeof saved[id] === "string") field.value=saved[id]; }); } catch (error) { console.warn("Resume draft restore failed", error); }
}
function saveResumeDraft() {
  try { const data={}; RESUME_FIELD_IDS.forEach(id => { const field=document.getElementById(id); if(field) data[id]=field.value; }); localStorage.setItem(RESUME_DRAFT_KEY, JSON.stringify(data)); } catch (error) { console.warn("Resume draft save failed", error); }
}

const CUSTOM_SECTIONS_KEY="resumebuild-custom-sections-v1";
function getCustomResumeSections(){try{return JSON.parse(localStorage.getItem(CUSTOM_SECTIONS_KEY)||"[]").filter(x=>x&&typeof x.title==="string"&&typeof x.content==="string");}catch(e){return[];}}
function saveCustomResumeSections(items){try{localStorage.setItem(CUSTOM_SECTIONS_KEY,JSON.stringify(items));}catch(e){}}
function renderCustomResumeSections(){
 const list=document.getElementById("custom-section-list"),paper=document.getElementById("resume-paper");if(!list||!paper)return;
 const items=getCustomResumeSections();list.replaceChildren();
 items.forEach((item,index)=>{const row=document.createElement("div");row.className="custom-section-row";const label=document.createElement("span");label.textContent=item.title;const remove=document.createElement("button");remove.type="button";remove.className="btn btn-outline btn-sm";remove.textContent="Remove";remove.addEventListener("click",()=>{const next=getCustomResumeSections();next.splice(index,1);saveCustomResumeSections(next);renderCustomResumeSections();});row.append(label,remove);list.appendChild(row);});
 paper.querySelectorAll("[data-custom-resume-section]").forEach(node=>node.remove());
 items.forEach(item=>{const section=document.createElement("section");section.className="pv-section";section.dataset.customResumeSection="true";const title=document.createElement("h2");title.className="pv-sec-title";title.textContent=item.title;const body=document.createElement("div");body.className="pv-desc";body.textContent=item.content;section.append(title,body);paper.appendChild(section);});
}
function addCustomResumeSection(){
 const title=document.getElementById("custom-section-title"),content=document.getElementById("custom-section-content");if(!title||!content)return;
 const name=title.value.trim(),details=content.value.trim();if(!name||!details){window.alert("Enter both a section title and details.");return;}
 const items=getCustomResumeSections();if(items.length>=8){window.alert("You can add up to 8 custom sections.");return;}
 items.push({title:name,content:details});saveCustomResumeSections(items);title.value="";content.value="";renderCustomResumeSections();updateResumeState();
}
function focusResumePreview(){switchPage("builder");const paper=document.getElementById("resume-paper");paper?.scrollIntoView({behavior:"smooth",block:"start"});document.querySelectorAll(".workflow-step").forEach((b,i)=>b.classList.toggle("active",i===2));}

function updateResumeState() {
  saveResumeDraft();
  setText("pv-name", fieldValue("input-fullname"), "Your Name");
  setText("pv-title", fieldValue("input-title"), "Your Professional Title");
  setText("pv-email", fieldValue("input-email"), "");
  setText("pv-phone", fieldValue("input-phone"), "");
  setText("pv-location", fieldValue("input-location"), "");
  setText("pv-links", fieldValue("input-links"), "");
  const projects = document.getElementById("pv-projects");
  const projectSection = document.getElementById("pv-projects-section");
  if (projects) projects.textContent = fieldValue("input-projects");
  if (projectSection) projectSection.hidden = !fieldValue("input-projects");
  const achievements = document.getElementById("pv-achievements");
  const achievementSection = document.getElementById("pv-achievements-section");
  if (achievements) achievements.textContent = fieldValue("input-achievements");
  if (achievementSection) achievementSection.hidden = !fieldValue("input-achievements");
  setText("pv-summary", fieldValue("input-summary"), "");
  setText("pv-company", fieldValue("input-company"), "");
  setText("pv-role", fieldValue("input-role"), "");
  setText("pv-duration", fieldValue("input-duration"), "");
  setText("pv-exp-desc", fieldValue("input-exp-desc"), "");
  setText("pv-school", fieldValue("input-school"), "");
  setText("pv-edu-year", fieldValue("input-edu-year"), "");
  setText("pv-degree", fieldValue("input-degree"), "");
  renderCustomResumeSections();
  const skills = document.getElementById("pv-skills");
  if (skills) {
    skills.replaceChildren();
    fieldValue("input-skills").split(",").map(x => x.trim()).filter(Boolean).forEach(skill => {
      const tag = document.createElement("span"); tag.className = "pv-tag"; tag.textContent = skill; skills.appendChild(tag);
    });
  }
}

async function handleResumeFile(file) {
  if (!file) return;
  const status = document.getElementById("uploadStatus");
  const fileName = document.getElementById("reviewFileName");
  const button = document.getElementById("runReviewButton");
  const setStatus = message => { if (status) status.textContent = message; const builderStatus = document.getElementById("builderUploadStatus"); if (builderStatus && builderUploadMode) builderStatus.textContent = message; };
  if (file.size > 8 * 1024 * 1024) { setStatus("File is larger than 8 MB. Please choose a smaller file."); return; }
  const ext = file.name.split(".").pop().toLowerCase();
  if (!["pdf", "docx", "txt"].includes(ext)) { setStatus("Unsupported format. Please upload a PDF, DOCX or TXT file."); return; }
  setStatus("Reading your resume securely in this browser…");
  if (button) button.disabled = true;
  try {
    let text = "";
    if (ext === "txt") {
      text = await file.text();
    } else if (ext === "pdf") {
      if (!window.pdfjsLib) throw new Error("PDF reader library could not load. Please try a TXT or DOCX file.");
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      const pages = [];
      for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
        const page = await pdf.getPage(pageNo);
        const content = await page.getTextContent();
        const rows = [];
        content.items.forEach(item => {
          const y = Math.round(item.transform?.[5] || 0);
          let row = rows.find(entry => Math.abs(entry.y - y) <= 2);
          if (!row) { row = { y, parts: [] }; rows.push(row); }
          row.parts.push(item.str);
        });
        rows.sort((a, b) => b.y - a.y);
        pages.push(rows.map(row => row.parts.join(" ").trim()).filter(Boolean).join("\n"));
      }
      text = pages.join("\n");
    } else {
      if (!window.mammoth) throw new Error("DOCX reader library could not load. Please try a PDF or TXT file.");
      const result = await window.mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      text = result.value || "";
    }
    text = text.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    if (text.length < 80) throw new Error("We could not read enough text. This may be a scanned image PDF. Please upload a text-based PDF or DOCX.");
    uploadedResumeText = text;
    uploadedResumeName = file.name;
    if (fileName) fileName.textContent = file.name;
    setStatus(`Ready: ${file.name}. Your resume text was extracted in your browser.`);
    if (button) button.disabled = false;
    if (builderUploadMode) {
      const imported = importResumeIntoBuilder(text);
      builderUploadMode = false;
      if (imported) { switchPage("builder"); setBuilderStep(1); document.getElementById("resume-paper")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
      return;
    }
    renderResumeReview();
    switchPage("ats-checker");
  } catch (error) {
    uploadedResumeText = "";
    uploadedResumeName = "";
    if (button) button.disabled = true;
    setStatus(error?.message || "Could not read this file. Please try another document.");
    if (fileName) fileName.textContent = "No readable resume loaded";
  }
}

function renderResumeReview() {
  if (!uploadedResumeText) return;
  const text = uploadedResumeText;
  const words = text.match(/[A-Za-z0-9+#.-]+/g) || [];
  const wordCount = words.length;
  const checks = [
    { label: "Email address", ok: /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text), tip: "Add a professional email address." },
    { label: "Phone number", ok: /(?:\+?\d[\d\s().-]{7,}\d)/.test(text), tip: "Add a reachable phone number with country code if applying internationally." },
    { label: "Professional summary / profile", ok: /\b(summary|profile|objective|about me|professional statement)\b/i.test(text), tip: "Add a short professional summary tailored to the roles you want." },
    { label: "Work experience", ok: /\b(experience|employment|work history|professional history|internship)\b/i.test(text), tip: "Include relevant work experience, internships or projects." },
    { label: "Education", ok: /\b(education|qualification|university|college|degree|bachelor|master)\b/i.test(text), tip: "Include your education, institution and graduation year." },
    { label: "Skills", ok: /\b(skills|technical skills|core competencies|key competencies)\b/i.test(text), tip: "Add a clearly labelled skills section with relevant skills." },
    { label: "Projects or portfolio", ok: /\b(projects?|portfolio|github|linkedin)\b/i.test(text), tip: "Add relevant projects, a portfolio or professional profile link when useful for your field." },
    { label: "Dates or time periods", ok: /\b(19|20)\d{2}\b/.test(text) || /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(text), tip: "Check that education and employment dates are clear and consistent." },
    { label: "Achievement-focused language", ok: /\b(achieved|improved|reduced|increased|delivered|built|managed|led|created|saved|launched|designed|automated)\b/i.test(text), tip: "Where accurate, start bullet points with strong action verbs and explain your contribution." },
    { label: "Measurable results", ok: /\b\d+(?:\.\d+)?\s*(%|percent|users|customers|projects|hours|days|weeks|months|years|\+|k|m)\b/i.test(text) || /\b(increased|reduced|saved|grew|improved)\b.{0,55}\b\d+/i.test(text), tip: "Add truthful numbers or measurable outcomes to demonstrate impact, where possible." }
  ];
  const passed = checks.filter(item => item.ok).length;
  const results = document.getElementById("resumeReviewResults");
  if (!results) return;
  results.replaceChildren();

  const summary = document.createElement("div"); summary.className = "review-summary";
  const titleWrap = document.createElement("div");
  const title = document.createElement("h3"); title.textContent = "Resume review complete";
  const subtitle = document.createElement("p"); subtitle.textContent = uploadedResumeName;
  titleWrap.append(title, subtitle);
  const count = document.createElement("strong"); count.textContent = `${passed} of ${checks.length} review checks found`;
  summary.append(titleWrap, count); results.appendChild(summary);

  const metrics = document.createElement("div"); metrics.className = "review-metrics";
  [[wordCount, "Words"], [Math.ceil(wordCount / 450), "Approx. pages*"], [checks.length - passed, "Items to review"]].forEach(([value,label]) => {
    const metric = document.createElement("div"); metric.className = "review-metric";
    const strong = document.createElement("strong"); strong.textContent = String(value);
    const small = document.createElement("span"); small.textContent = label;
    metric.append(strong,small); metrics.appendChild(metric);
  });
  results.appendChild(metrics);

  const grid = document.createElement("div"); grid.className = "review-checks";
  checks.forEach(item => {
    const card = document.createElement("div"); card.className = `review-check ${item.ok ? "" : "missing"}`;
    const icon = document.createElement("i"); icon.setAttribute("data-lucide", item.ok ? "check-circle-2" : "alert-circle");
    const label = document.createElement("span"); label.textContent = item.label + (item.ok ? " — found" : " — not detected");
    card.append(icon, label); grid.appendChild(card);
  });
  results.appendChild(grid);

  const suggestions = checks.filter(item => !item.ok).map(item => item.tip);
  if (wordCount < 180) suggestions.unshift("This resume has relatively little text. Consider adding relevant projects, responsibilities and skills if they strengthen your application.");
  if (wordCount > 900) suggestions.unshift("This resume is quite lengthy. Consider removing repeated or less relevant details while keeping important evidence.");
  if (!suggestions.length) suggestions.push("The main checks were found. Review spelling, dates, relevance and formatting before applying.");
  const box = document.createElement("div"); box.className = "review-suggestions";
  const heading = document.createElement("h4"); heading.textContent = "Recommended improvements";
  const list = document.createElement("ul");
  suggestions.forEach(suggestion => { const li = document.createElement("li"); li.textContent = suggestion; list.appendChild(li); });
  box.append(heading, list); results.appendChild(box);

  const jobText = fieldValue("ats-job-desc");
  if (jobText) appendKeywordMatch(results, text, jobText);
  const reportButton = document.createElement("button");
  reportButton.type = "button"; reportButton.className = "btn btn-outline review-download";
  reportButton.textContent = "Download review report";
  reportButton.addEventListener("click", () => downloadResumeReviewReport(checks, suggestions, wordCount));
  results.appendChild(reportButton);

  const aiNotice = document.createElement("div");
  aiNotice.className = "ai-consent no-print";
  aiNotice.setAttribute("role", "status");
  aiNotice.textContent = "AI rewriting is temporarily paused to keep ResumeBuild free while API billing is not configured. You can still use the resume review checklist, job-description keyword comparison and download your review report.";
  results.appendChild(aiNotice);

  const aiStatus = document.createElement("p");
  aiStatus.id = "aiRewriteStatus";
  aiStatus.className = "review-disclaimer no-print";
  aiStatus.setAttribute("role", "status");
  aiStatus.setAttribute("aria-live", "polite");
  aiStatus.textContent = "AI Rewrite is temporarily unavailable. Your uploaded resume is still reviewed in this browser.";
  results.appendChild(aiStatus);

  const disclaimer = document.createElement("p"); disclaimer.className = "review-disclaimer";
  disclaimer.textContent = "*Page count is a rough estimate. This is an automated text-based checklist, not a certified ATS score, recruiter assessment, grammar audit or interview guarantee. Some checks may miss differently worded sections. Verify all suggestions. Your file is processed in this browser and is not sent to our server by this review feature.";
  results.appendChild(disclaimer);
  if (window.lucide) window.lucide.createIcons();
}

async function requestAIRewrite() {
  const consent = document.getElementById("aiRewriteConsent");
  const button = document.getElementById("aiRewriteButton");
  const status = document.getElementById("aiRewriteStatus");
  if (!uploadedResumeText || !consent?.checked || !button || !status) return;
  if (!window.location.hostname.endsWith("pages.dev")) {
    status.textContent = "AI rewrite is available on the Cloudflare Pages version of this website.";
    return;
  }
  const user = window.resumeAuth?.currentUser;
  if (!user) {
    status.textContent = "Please log in first, then return here and select Rewrite My Resume.";
    document.getElementById("openLogin")?.click();
    return;
  }
  button.disabled = true;
  status.textContent = "Preparing your rewritten resume…";
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({
        resumeText: uploadedResumeText,
        jobDescription: fieldValue("ats-job-desc")
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "AI rewrite could not be completed.");
    renderAIResume(result.rewrite || {});
    status.textContent = "AI rewrite is ready. Please verify every detail before downloading or sharing.";
  } catch (error) {
    status.textContent = error.message || "AI rewrite failed. Please try again.";
  } finally {
    button.disabled = !consent.checked;
  }
}

function renderAIResume(data) {
  const results = document.getElementById("resumeReviewResults");
  if (!results) return;
  document.getElementById("aiResumePrint")?.remove();
  const sheet = document.createElement("article");
  sheet.id = "aiResumePrint";
  sheet.className = "ai-resume-print";

  const header = document.createElement("header");
  const name = document.createElement("h1");
  name.textContent = data.fullName || "Resume";
  const title = document.createElement("h2");
  title.textContent = data.targetTitle || "";
  const contact = document.createElement("p");
  contact.className = "ai-resume-contact";
  contact.textContent = [data.email, data.phone, data.location].filter(Boolean).join("  |  ");
  header.append(name, title, contact);
  sheet.appendChild(header);

  const addSection = (headingText, content) => {
    if (!content || (Array.isArray(content) && !content.length)) return;
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = headingText;
    section.appendChild(heading);
    if (Array.isArray(content)) {
      const list = document.createElement("ul");
      content.forEach(item => {
        const li = document.createElement("li");
        li.textContent = String(item);
        list.appendChild(li);
      });
      section.appendChild(list);
    } else {
      const lines = String(content).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      const bullets = lines.some(line => /^[-•*]\s+/.test(line));
      if (bullets) {
        const list = document.createElement("ul");
        lines.forEach(line => {
          const li = document.createElement("li");
          li.textContent = line.replace(/^[-•*]\s+/, "");
          list.appendChild(li);
        });
        section.appendChild(list);
      } else {
        lines.forEach(line => {
          const p = document.createElement("p");
          p.textContent = line;
          section.appendChild(p);
        });
      }
    }
    sheet.appendChild(section);
  };

  addSection("Professional Summary", data.professionalSummary);
  addSection("Key Skills", Array.isArray(data.skills) ? data.skills : []);
  addSection("Professional Experience", data.experience);
  addSection("Education", data.education);
  addSection("Projects", data.projects);

  const printActions = document.createElement("div");
  printActions.className = "ai-resume-actions no-print";
  const printButton = document.createElement("button");
  printButton.type = "button";
  printButton.className = "btn btn-primary";
  printButton.textContent = "Print / Save as PDF";
  printButton.addEventListener("click", () => window.print());
  printActions.appendChild(printButton);

  const applyButton = document.createElement("button");
  applyButton.type = "button";
  applyButton.className = "btn btn-outline";
  applyButton.textContent = "Use main details in Resume Builder";
  applyButton.addEventListener("click", () => {
    const values = {
      "input-fullname": data.fullName,
      "input-title": data.targetTitle,
      "input-email": data.email,
      "input-phone": data.phone,
      "input-location": data.location,
      "input-summary": data.professionalSummary,
      "input-skills": Array.isArray(data.skills) ? data.skills.join(", ") : "",
      "input-exp-desc": data.experience || "",
      "input-degree": data.education || "",
      "input-projects": data.projects || ""
    };
    Object.entries(values).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field && value) field.value = value;
    });
    updateResumeState();
    switchPage("builder");
  });
  printActions.appendChild(applyButton);
  results.appendChild(printActions);
  results.appendChild(sheet);

  const notes = document.createElement("div");
  notes.className = "review-suggestions no-print";
  const notesHeading = document.createElement("h4");
  notesHeading.textContent = "AI review notes — check before using";
  notes.appendChild(notesHeading);
  const noteList = document.createElement("ul");
  (Array.isArray(data.improvementNotes) ? data.improvementNotes : []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = String(item);
    noteList.appendChild(li);
  });
  if (data.integrityNote) {
    const li = document.createElement("li");
    li.textContent = String(data.integrityNote);
    noteList.appendChild(li);
  }
  notes.appendChild(noteList);
  results.appendChild(notes);
  if (window.lucide) window.lucide.createIcons();
}

function downloadResumeReviewReport(checks, suggestions, wordCount) {
  const lines = [
    "BRANDBLITZ RESUME REVIEW",
    "File: " + uploadedResumeName,
    "Word count: " + wordCount,
    "",
    "REVIEW CHECKS",
    ...checks.map(item => (item.ok ? "[FOUND] " : "[REVIEW] ") + item.label),
    "",
    "SUGGESTED IMPROVEMENTS",
    ...suggestions.map((item,index) => (index + 1) + ". " + item),
    "",
    "Note: This automated checklist is guidance only, not a certified ATS score or hiring prediction."
  ];
  const blob = new Blob([lines.join("\n")], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "resume-review-report.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function appendKeywordMatch(container, resumeText, jobText) {
  const stop = new Set("the and for with you your our are was were this that from have has had will can all any not but job role work team skills experience ability required preferred responsibilities qualifications about into using use used their they them who what when where how also more less than then such other including".split(" "));
  const terms = [...new Set((jobText.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) || []).filter(term => !stop.has(term)))];
  const matched = terms.filter(term => resumeText.toLowerCase().includes(term));
  const missing = terms.filter(term => !resumeText.toLowerCase().includes(term));
  const wrap = document.createElement("div"); wrap.className = "review-keywords";
  const heading = document.createElement("h4"); heading.textContent = `Job-description keyword comparison: ${matched.length} of ${terms.length} terms found`;
  const info = document.createElement("p"); info.className = "review-disclaimer"; info.textContent = "This is simple keyword overlap, not a true ATS ranking. Add missing terms only when they accurately reflect your skills and experience.";
  wrap.append(heading);
  const chips = document.createElement("div");
  matched.slice(0,25).forEach(term => { const chip = document.createElement("span"); chip.className = "keyword-chip"; chip.textContent = "✓ " + term; chips.appendChild(chip); });
  missing.slice(0,25).forEach(term => { const chip = document.createElement("span"); chip.className = "keyword-chip"; chip.style.background = "#fff4e5"; chip.style.color = "#94611b"; chip.textContent = "+ " + term; chips.appendChild(chip); });
  wrap.append(chips, info); container.appendChild(wrap);
}

function runATSCheck() {
  if (!uploadedResumeText) { window.alert("Please upload your resume first."); return; }
  renderResumeReview();
}
function triggerAISummary() {
  window.alert("AI writing assistance is not connected yet. The resume review currently provides checklist and keyword suggestions only.");
}
function exportWord() {
  if (!fieldValue("input-fullname")) { window.alert("Please enter your name before exporting your resume."); document.getElementById("input-fullname")?.focus(); return; }
  const paper = document.getElementById("resume-paper"); if (!paper) return;
  const clone = paper.cloneNode(true); clone.querySelectorAll("[hidden]").forEach(node => node.remove());
  const styles = "<style>body{font-family:Arial,sans-serif;color:#202b3c;line-height:1.45}h1{font-size:24pt;margin:0 0 5pt}h2{font-size:12pt;border-bottom:1px solid #bbb;margin:16pt 0 6pt}p{white-space:pre-wrap}.pv-tag{display:inline-block;margin:2pt 5pt 2pt 0;padding:2pt 5pt;border:1px solid #ddd}</style>";
  const html = "<!doctype html><html><head><meta charset=\"utf-8\">" + styles + "</head><body>" + clone.outerHTML + "</body></html>";
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url;
  link.download = (fieldValue("input-fullname").replace(/[^a-z0-9-_]+/gi, "-") || "resume") + ".doc";
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportPDF() {
  if (!fieldValue("input-fullname")) { window.alert("Please enter your name before exporting your resume."); document.getElementById("input-fullname")?.focus(); return; }
  window.print();
}

window.switchPage = switchPage;
window.startNewResume = startNewResume;
window.startBuilderUpload = startBuilderUpload;
window.setBuilderStep = setBuilderStep;
window.addCustomResumeSection = addCustomResumeSection;
window.focusResumePreview = focusResumePreview;
window.selectResumeTemplate = selectResumeTemplate;
window.updateResumeState = updateResumeState;
window.triggerAISummary = triggerAISummary;
window.exportPDF = exportPDF;
window.exportWord = exportWord;
window.runATSCheck = runATSCheck;

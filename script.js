// ============================================================
// Set your custom System Lead password here
// ============================================================
const ADMIN_PASS = "PATEL@GRID6";

// Default Team State (1 Leader + 5 Members = 6 Total Members)
const defaultSlots = [
  {
    id: 0,
    role: "System Lead & Architect (Leader)",
    desc: "System Strategy, Client Pipeline, Final Review & Operations Control",
    member: "Nikhil Patel (System Lead)",
    status: "lead",
    task: "Complete recruitment, run interviews, and manage live tracking.",
    deadline: "",
    taskStatus: "Active"
  },
  {
    id: 1,
    role: "Slot 1: Market Research + Frontend / UI",
    desc: "Chart & News Analysis + Web Interface & Visual Layout",
    member: "Member #1 (Confirmed)",
    status: "filled",
    task: "Prepare daily market trend notes and UI components.",
    deadline: "",
    taskStatus: "In Progress"
  },
  {
    id: 2,
    role: "Slot 2: Trading / Risk + Backend / Logic",
    desc: "Risk Rules, Automation Scripts & Core System Logic",
    member: "Member #2 (Confirmed)",
    status: "filled",
    task: "Draft risk rules document and core logic scripts.",
    deadline: "",
    taskStatus: "In Progress"
  },
  {
    id: 3,
    role: "Slot 3: Data & Financial Tracking + Tools",
    desc: "P&L Data Management, Analytics & Dashboard Logic",
    member: "",
    status: "vacant",
    task: "Open Vacancy — Task will be assigned after interview.",
    deadline: "",
    taskStatus: "Pending"
  },
  {
    id: 4,
    role: "Slot 4: System Testing + Cybersecurity",
    desc: "Backtesting, Bug Hunting, Data Protection & Security Checks",
    member: "",
    status: "vacant",
    task: "Open Vacancy — Task will be assigned after interview.",
    deadline: "",
    taskStatus: "Pending"
  },
  {
    id: 5,
    role: "Slot 5: Team Coordination + Daily Review",
    desc: "Daily Update Tracking, Reporting & Execution Discipline",
    member: "",
    status: "vacant",
    task: "Open Vacancy — Task will be assigned after interview.",
    deadline: "",
    taskStatus: "Pending"
  }
];

function safeReadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn("Storage read fallback:", key, err);
    return fallback;
  }
}

let slots = safeReadStorage("g6_slots_en", defaultSlots);
let applications = safeReadStorage("g6_applications_en", []);
let dailyLogs = safeReadStorage("g6_daily_logs_en", [
  {
    member: "Nikhil Patel (Lead)",
    work: "Built the Grid Six portal and task system with 2 confirmed members.",
    hours: "1.5 Hours",
    status: "Completed",
    time: "Today"
  }
]);

if (!Array.isArray(slots)) slots = defaultSlots;
if (!Array.isArray(applications)) applications = [];
if (!Array.isArray(dailyLogs)) dailyLogs = [];

function saveData() {
  try {
    localStorage.setItem("g6_slots_en", JSON.stringify(slots));
    localStorage.setItem("g6_applications_en", JSON.stringify(applications));
    localStorage.setItem("g6_daily_logs_en", JSON.stringify(dailyLogs));
  } catch (err) {
    console.warn("Storage save warning:", err);
  }
}

function formatDeadline(dtValue) {
  if (!dtValue) return "No deadline set";
  const d = new Date(dtValue);
  if (isNaN(d.getTime())) return dtValue;
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " • " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}

function renderAll() {
  renderRoster();
  renderMemberSelect();
  renderDailyLogs();
  renderAdminTables();
}

function renderRoster() {
  const grid = document.getElementById("rosterGrid");
  if (!grid) return;
  grid.innerHTML = "";

  let filled = 0;
  let vacant = 0;

  slots.forEach((s) => {
    if (s.status === "filled") filled++;
    if (s.status === "vacant") vacant++;

    const card = document.createElement("div");
    card.className = `slot-card ${s.status}`;

    let tagHTML = "";
    let actionHTML = "";

    if (s.status === "lead") {
      tagHTML = `<span class="tag tag-lead">System Lead</span>`;
    } else if (s.status === "filled") {
      tagHTML = `<span class="tag tag-filled">Slot Filled</span>`;
    } else {
      tagHTML = `<span class="tag tag-open">Vacancy Open</span>`;
      actionHTML = `<button type="button" class="btn btn-gold full-btn" onclick="openApplyModal('${s.role.replace(/'/g, "\\'")}')">Apply for This Slot</button>`;
    }

    const deadlineHTML = s.deadline
      ? `<br><small style="color:var(--gold);"><strong>Deadline:</strong> ${formatDeadline(s.deadline)}</small>`
      : "";
    const statusBadge = s.taskStatus
      ? ` <span style="font-size:0.78rem; color:var(--muted);">[${s.taskStatus}]</span>`
      : "";

    card.innerHTML = `
      <div>
        <div class="slot-top">
          <span class="slot-member-name">${s.status === "vacant" ? "OPEN SEAT" : s.member}</span>
          ${tagHTML}
        </div>
        <div class="slot-role">${s.role}</div>
        <div class="slot-desc">${s.desc}</div>
      </div>
      <div class="slot-task">
        <strong>Assigned Task:</strong> ${s.task}${statusBadge}${deadlineHTML}
      </div>
      ${actionHTML}
    `;
    grid.appendChild(card);
  });

  const filledEl = document.getElementById("filledCount");
  const vacantEl = document.getElementById("vacantCount");
  if (filledEl) filledEl.textContent = `${filled} / 5`;
  if (vacantEl) vacantEl.textContent = `${vacant} ${vacant === 1 ? "Slot" : "Slots"}`;
}

function renderMemberSelect() {
  const sel = document.getElementById("logMemberSelect");
  if (sel) {
    sel.innerHTML = "";
    slots.forEach((s) => {
      if (s.status !== "vacant") {
        const opt = document.createElement("option");
        opt.value = String(s.id);
        opt.textContent = `${s.member || "Member"} — ${s.role}`;
        sel.appendChild(opt);
      }
    });
  }

  const taskTargetSel = document.getElementById("adminTaskTarget");
  if (taskTargetSel) {
    taskTargetSel.innerHTML = "";
    slots.forEach((s) => {
      if (s.id !== 0) {
        const opt = document.createElement("option");
        opt.value = String(s.id);
        const assignee = s.member ? s.member : "Vacant Slot";
        opt.textContent = `${s.role} (${assignee})`;
        taskTargetSel.appendChild(opt);
      }
    });
  }
}

function renderDailyLogs() {
  const tbody = document.getElementById("dailyLogsTable");
  if (!tbody) return;
  tbody.innerHTML = "";

  dailyLogs.slice().reverse().forEach((log) => {
    const tr = document.createElement("tr");
    const statusColor = log.status === "Completed" ? "var(--green)" : "var(--gold)";
    tr.innerHTML = `
      <td><strong>${log.member}</strong></td>
      <td>${log.work}<br><small style="color:${statusColor}; font-weight:700;">Status: ${log.status || "Updated"}</small></td>
      <td><span style="color:var(--gold); font-weight:700;">${log.hours}</span><br><small style="color:var(--muted);">${log.time}</small></td>
    `;
    tbody.appendChild(tr);
  });
}

function submitDailyLog(e) {
  if (e && e.preventDefault) e.preventDefault();
  const memberSel = document.getElementById("logMemberSelect");
  const workEl = document.getElementById("logWorkText");
  const hoursEl = document.getElementById("logHours");
  const statusEl = document.getElementById("logTaskStatus");
  const formEl = document.getElementById("dailyLogForm");

  const slotId = memberSel ? parseInt(memberSel.value, 10) : 1;
  const slotObj = slots.find((s) => s.id === slotId);
  const memberLabel = slotObj
    ? `${slotObj.member || "Member"} (${slotObj.role.split(":")[0]})`
    : "Team Member";

  const work = workEl ? workEl.value.trim() : "";
  const hours = hoursEl ? hoursEl.value : "1.5 Hours";
  const status = statusEl ? statusEl.value : "Completed";
  if (!work) return;

  if (slotObj) {
    slotObj.taskStatus = status;
  }

  const now = new Date();
  const timeStr =
    now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) +
    ", " +
    now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  dailyLogs.push({ member: memberLabel, work, hours, status, time: timeStr });
  saveData();
  renderAll();
  if (formEl) formEl.reset();
  alert("Daily work update and task status recorded!");
}

function addAdminTask(e) {
  if (e && e.preventDefault) e.preventDefault();
  const targetSel = document.getElementById("adminTaskTarget");
  const taskInput = document.getElementById("adminTaskText");
  const deadlineInput = document.getElementById("adminTaskDeadline");

  const slotId = targetSel ? parseInt(targetSel.value, 10) : null;
  const taskText = taskInput ? taskInput.value.trim() : "";
  const deadlineVal = deadlineInput ? deadlineInput.value : "";

  if (!slotId || !taskText) {
    alert("Please select a role/member and enter a task.");
    return;
  }

  const slotObj = slots.find((s) => s.id === slotId);
  if (!slotObj) return;

  slotObj.task = taskText;
  slotObj.deadline = deadlineVal;
  slotObj.taskStatus = "Assigned";

  saveData();
  renderAll();

  if (taskInput) taskInput.value = "";
  if (deadlineInput) deadlineInput.value = "";
  alert(`Task and deadline assigned to ${slotObj.role}!`);
}

function openApplyModal(roleName) {
  if (roleName) {
    const sel = document.getElementById("appRole");
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === roleName) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
  }
  const modal = document.getElementById("applyModal");
  if (modal) modal.classList.add("active");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
}

function submitApplication(e) {
  if (e && e.preventDefault) e.preventDefault();

  const nameEl = document.getElementById("appName");
  const contactEl = document.getElementById("appContact");
  const roleEl = document.getElementById("appRole");
  const modeEl = document.getElementById("appMode");
  const skillsEl = document.getElementById("appSkills");
  const agreeEl = document.getElementById("appAgree");
  const formEl = document.getElementById("vacancyForm");

  if (!agreeEl || !agreeEl.checked) {
    alert("Please accept the Grid Six agreement checkbox first.");
    return;
  }

  const app = {
    id: Date.now(),
    name: nameEl ? nameEl.value.trim() : "",
    contact: contactEl ? contactEl.value.trim() : "",
    role: roleEl ? roleEl.value : "",
    mode: modeEl ? modeEl.value : "",
    skills: skillsEl ? skillsEl.value.trim() : "",
    status: "Pending Interview"
  };

  if (!app.name || !app.contact || !app.skills) {
    alert("Please fill out all required fields.");
    return;
  }

  applications.push(app);
  saveData();
  renderAdminTables();

  if (formEl) formEl.reset();
  closeModal("applyModal");
  alert("Application submitted! You will be contacted for the interview.");
}

function openAdminGate() {
  const panel = document.getElementById("adminPanel");
  if (panel && panel.classList.contains("unlocked")) {
    panel.scrollIntoView({ behavior: "smooth" });
    return;
  }
  const passInput = document.getElementById("adminPassInput");
  if (passInput) passInput.value = "";
  const gateModal = document.getElementById("adminGateModal");
  if (gateModal) gateModal.classList.add("active");
}

function verifyAdminPassword() {
  const passInput = document.getElementById("adminPassInput");
  const entered = passInput ? passInput.value : "";
  closeModal("adminGateModal");

  const panel = document.getElementById("adminPanel");
  if (entered === ADMIN_PASS) {
    if (panel) {
      panel.classList.add("unlocked");
      panel.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    const privModal = document.getElementById("privModal");
    if (privModal) privModal.classList.add("active");
  }
}

function lockAdminPanel() {
  const panel = document.getElementById("adminPanel");
  if (panel) panel.classList.remove("unlocked");
}

function renderAdminTables() {
  const appBody = document.getElementById("applicationsTable");
  if (appBody) {
    appBody.innerHTML = "";

    if (applications.length === 0) {
      appBody.innerHTML = `<tr><td colspan="6" style="color:var(--muted); text-align:center;">No vacancy applications yet.</td></tr>`;
    } else {
      applications.forEach((app) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${app.name}</strong></td>
          <td>${app.contact}</td>
          <td>${app.role}</td>
          <td>${app.mode}</td>
          <td>${app.skills}</td>
          <td>
            ${
              app.status === "Pending Interview"
                ? `
                  <button type="button" class="btn btn-gold" style="padding:5px 10px; font-size:0.78rem;" onclick="approveApplicant(${app.id})">Approve</button>
                  <button type="button" class="btn btn-danger" style="padding:5px 10px; font-size:0.78rem;" onclick="rejectApplicant(${app.id})">Reject</button>
                `
                : `<strong style="color:var(--green);">${app.status}</strong>`
            }
          </td>
        `;
        appBody.appendChild(tr);
      });
    }
  }

  const slotBody = document.getElementById("adminSlotsTable");
  if (slotBody) {
    slotBody.innerHTML = "";
    slots.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${s.id}</strong></td>
        <td>${s.role}</td>
        <td><input type="text" id="editName_${s.id}" value="${s.member}" placeholder="Vacant" style="padding:6px 8px; font-size:0.83rem;"></td>
        <td><input type="text" id="editTask_${s.id}" value="${s.task}" style="padding:6px 8px; font-size:0.83rem;"></td>
        <td>
          <button type="button" class="btn btn-gold" style="padding:6px 10px; font-size:0.78rem;" onclick="updateSlot(${s.id})">Save</button>
          ${s.id !== 0 && s.status === "filled" ? `<button type="button" class="btn btn-danger" style="padding:6px 10px; font-size:0.78rem;" onclick="vacateSlot(${s.id})">Vacate</button>` : ""}
        </td>
      `;
      slotBody.appendChild(tr);
    });
  }
}

function approveApplicant(id) {
  const app = applications.find((a) => a.id === id);
  if (!app) return;

  const openSlot = slots.find((s) => s.status === "vacant");
  if (!openSlot) {
    alert("All 5 member slots are already filled!");
    return;
  }

  openSlot.member = app.name;
  openSlot.status = "filled";
  openSlot.task = "Onboarding Completed — Awaiting first assigned task.";
  openSlot.taskStatus = "Pending";
  app.status = `Approved (${openSlot.role.split(":")[0]})`;

  saveData();
  renderAll();
  alert(`${app.name} has been assigned to ${openSlot.role}!`);
}

function rejectApplicant(id) {
  applications = applications.filter((a) => a.id !== id);
  saveData();
  renderAdminTables();
}

function updateSlot(id) {
  const slot = slots.find((s) => s.id === id);
  if (!slot) return;
  const nameInput = document.getElementById(`editName_${id}`);
  const taskInput = document.getElementById(`editTask_${id}`);

  const newName = nameInput ? nameInput.value.trim() : slot.member;
  const newTask = taskInput ? taskInput.value.trim() : slot.task;

  slot.member = newName;
  slot.task = newTask;
  if (id !== 0) {
    slot.status = newName ? "filled" : "vacant";
  }

  saveData();
  renderAll();
  alert("Slot and task updated!");
}

function vacateSlot(id) {
  const slot = slots.find((s) => s.id === id);
  if (!slot) return;
  slot.member = "";
  slot.status = "vacant";
  slot.task = "Open Vacancy — Task will be assigned after interview.";
  slot.deadline = "";
  slot.taskStatus = "Pending";
  saveData();
  renderAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderAll);
} else {
  renderAll();
}
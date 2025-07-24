function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { approved: [] };
  } catch (e) {
    return { approved: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function canTake(course, state, codeToCourse) {
  if (!course.prereq || course.prereq.length === 0) return true;
  return course.prereq.every(code => state.approved.includes(code));
}

function build() {
  const state = loadState();
  const app = document.querySelector("#app");
  const semTpl = document.querySelector("#semester-tpl");
  const courseTpl = document.querySelector("#course-tpl");
  const codeToCourse = new Map();

  // Flatten the list to quickly access courses by code
  DATA.forEach(s => s.courses.forEach(c => codeToCourse.set(c.code, c)));

  function redraw() {
    app.innerHTML = "";
    let approvedSct = 0;
    let totalSct = 0;

    DATA.forEach(sem => {
      const semNode = semTpl.content.cloneNode(true);
      semNode.querySelector("h2").textContent = `${sem.semester} semestre`;
      const ul = semNode.querySelector(".courses");

      sem.courses.forEach(course => {
        const li = courseTpl.content.cloneNode(true).querySelector("li");
        li.querySelector(".code").textContent = course.code;
        li.querySelector(".name").textContent = course.name;
        li.querySelector(".sct").textContent = `${course.sct} SCT`;

        totalSct += course.sct;

        const isApproved = state.approved.includes(course.code);
        const isAvailable = !isApproved && canTake(course, state, codeToCourse);

        if (isApproved) {
          li.classList.add("approved");
          approvedSct += course.sct;
        } else if (isAvailable) {
          li.classList.add("available");
        }

        li.addEventListener("click", () => {
          const idx = state.approved.indexOf(course.code);
          if (idx === -1) state.approved.push(course.code);
          else state.approved.splice(idx, 1);
          saveState(state);
          redraw();
        });

        ul.appendChild(li);
      });

      app.appendChild(semNode);
    });

    document.querySelector("#approvedSct").textContent = `SCT aprobados: ${approvedSct}`;
    document.querySelector("#pendingSct").textContent = `SCT pendientes: ${totalSct - approvedSct}`;
  }

  redraw();
}

// DATA is injected at build time
const DATA = data;
build();

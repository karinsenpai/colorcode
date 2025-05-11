let projects = JSON.parse(localStorage.getItem("colorProjects")) || [{ name: "プロジェクト1", colors: [] }];
let currentProjectIndex = parseInt(localStorage.getItem("currentProjectIndex")) || 0;

const output = document.getElementById("output");
const projectTabs = document.getElementById("projectTabs");
const addProjectBtn = document.getElementById("addProject");

function saveProjects() {
  localStorage.setItem("colorProjects", JSON.stringify(projects));
  localStorage.setItem("currentProjectIndex", currentProjectIndex);
}

function renderTabs() {
  projectTabs.innerHTML = "";
  projects.forEach((project, index) => {
    const tab = document.createElement("div");
    tab.className = "tab" + (index === currentProjectIndex ? " active" : "");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = project.name;
    nameSpan.onclick = () => {
      currentProjectIndex = index;
      saveProjects();
      renderTabs();
      renderHistory();
    };

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";  // ボタンのラッパー

    const renameBtn = document.createElement("button");
    renameBtn.textContent = "編集";
    renameBtn.className = "tab-btn";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      const newName = prompt("新しいプロジェクト名を入力してください:", project.name);
      if (newName) {
        projects[index].name = newName;
        saveProjects();
        renderTabs();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.className = "tab-btn";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm("本当にこのプロジェクトを削除しますか？")) {
        projects.splice(index, 1);
        if (projects.length === 0) {
          projects = [{ name: "プロジェクト1", colors: [] }];
          currentProjectIndex = 0;
        } else if (currentProjectIndex >= projects.length) {
          currentProjectIndex = projects.length - 1;
        }
        saveProjects();
        renderTabs();
        renderHistory();
      }
    };

    // ボタンをラッパーに追加
    buttonContainer.appendChild(renameBtn);
    buttonContainer.appendChild(deleteBtn);
    
    tab.appendChild(nameSpan);
    tab.appendChild(buttonContainer);  // ボタンのラッパーをタブに追加
    projectTabs.appendChild(tab);
  });
}

function addProject() {
  const name = prompt("新しいプロジェクト名を入力してください:");
  if (name) {
    projects.push({ name, colors: [] });
    currentProjectIndex = projects.length - 1;
    saveProjects();
    renderTabs();
    renderHistory();
  }
}

addProjectBtn.addEventListener("click", addProject);

function normalizeColor() {
  const hex = document.getElementById("hexInput").value.trim();
  const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
  const match = hex.match(hexRegex);

  if (!match) {
    output.innerHTML = "<span style='color:red;'>正しい形式の16進カラーコードを入力してください。</span>";
    return;
  }

  const hexValue = match[1].toUpperCase();
  const currentProject = projects[currentProjectIndex];

  if (currentProject.colors.includes(hexValue)) {
    const existing = [...output.children].find(div =>
      div.querySelector("span:last-of-type")?.textContent === "#" + hexValue
    );
    if (existing && !existing.querySelector(".same-color-note")) {
      const note = document.createElement("span");
      note.className = "same-color-note";
      note.textContent = "この色と同じ色です";
      existing.appendChild(note);
    }
    return;
  }

  currentProject.colors.unshift(hexValue);
  saveProjects();

  const r = parseInt(hexValue.substring(0, 2), 16) / 255;
  const g = parseInt(hexValue.substring(2, 4), 16) / 255;
  const b = parseInt(hexValue.substring(4, 6), 16) / 255;

  const contrastColor = getContrastColor(hexValue);

  const colorInfo = document.createElement("div");
  colorInfo.classList.add("color-info");

  colorInfo.innerHTML = `  
    <span>R: ${r.toFixed(3)}</span>
    <span>G: ${g.toFixed(3)}</span>
    <span>B: ${b.toFixed(3)}</span>
    <div class="color-preview" style="background-color: #${hexValue}; border-color: ${contrastColor};"></div>
    <span>#${hexValue}</span>
    <button class="history-remove-button" onclick="removeHistory(this)">削除</button>
  `;

  output.insertBefore(colorInfo, output.firstChild);
}

function getContrastColor(hex) {
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
}

function updatePreview() {
  const hex = document.getElementById("hexInput").value.trim();
  const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
  const match = hex.match(hexRegex);
  const preview = document.getElementById("colorPreview");
  if (match) {
    preview.style.backgroundColor = "#" + match[1];
    preview.style.borderColor = getContrastColor(match[1]);
  } else {
    preview.style.backgroundColor = "transparent";
    preview.style.borderColor = "#ccc";
  }
}

function openColorPicker() {
  document.getElementById("colorPicker").click();
}

function setColorFromPicker() {
  const color = document.getElementById("colorPicker").value;
  document.getElementById("hexInput").value = color;
  updatePreview();
  normalizeColor();
}

function clearHistory() {
  projects[currentProjectIndex].colors = [];
  saveProjects();
  renderHistory();
}

function removeHistory(button) {
  const colorInfo = button.parentElement;
  const colorHex = colorInfo.querySelector("span:last-of-type").textContent.replace("#", "");
  const project = projects[currentProjectIndex];
  project.colors = project.colors.filter(c => c !== colorHex);
  saveProjects();
  colorInfo.remove();
}

function renderHistory() {
  output.innerHTML = "";
  const project = projects[currentProjectIndex];
  project.colors.forEach(hexValue => {
    const r = parseInt(hexValue.substring(0, 2), 16) / 255;
    const g = parseInt(hexValue.substring(2, 4), 16) / 255;
    const b = parseInt(hexValue.substring(4, 6), 16) / 255;

    const contrastColor = getContrastColor(hexValue);

    const colorInfo = document.createElement("div");
    colorInfo.classList.add("color-info");

    colorInfo.innerHTML = `  
      <span>R: ${r.toFixed(3)}</span>
      <span>G: ${g.toFixed(3)}</span>
      <span>B: ${b.toFixed(3)}</span>
      <div class="color-preview" style="background-color: #${hexValue}; border-color: ${contrastColor};"></div>
      <span>#${hexValue}</span>
      <button class="history-remove-button" onclick="removeHistory(this)">削除</button>
    `;

    output.appendChild(colorInfo);
  });
}

// 初期化処理
renderTabs();
renderHistory();
updatePreview();

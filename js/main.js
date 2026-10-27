"use strict";

const clock = document.querySelector("#clock");
const desktop = document.querySelector(".desktop");
const computerIcon = document.querySelector('[data-app="my-computer"]');
const notepadIcon = document.querySelector('[data-app="notepad"]');
const settingsIcon = document.querySelector('[aria-label="Configurações"][data-app="settings"]');
const filesIcon = document.querySelector('[data-app="files"]');
const gamesIcon = document.querySelector('[data-app="games"]');
const computerWindow = document.querySelector("#computer-window");
const notepadWindow = document.querySelector("#notepad-window");
const settingsWindow = document.querySelector("#settings-window");
const filesWindow = document.querySelector("#files-window");
const gamesWindow = document.querySelector("#games-window");
const taskbarApps = document.querySelector("#taskbar-apps");
const aboutButton = document.querySelector("#about-button");
const aboutPanel = document.querySelector("#about-panel");
const aboutClose = document.querySelector("#about-close");
const aboutOk = document.querySelector("#about-ok");
const minimizeButton = computerWindow?.querySelector(".minimize-control");
const closeButton = computerWindow?.querySelector(".close-control");
const notepadTemplate = notepadWindow?.cloneNode(true);
const virtualFiles = window.PixelOSVirtualFiles;
const settingsMinimizeButton = document.querySelector("#settings-minimize");
const settingsCloseButton = document.querySelector("#settings-close");
const settingsSaveStatus = document.querySelector("#settings-save-status");
const wallpaperOptions = document.querySelectorAll("[data-wallpaper-option]");
const filesBackButton = document.querySelector("#files-back");
const filesPath = document.querySelector("#files-path");
const filesList = document.querySelector("#files-list");
const filePreview = document.querySelector("#file-preview");
const filePreviewTitle = document.querySelector("#file-preview-title");
const filePreviewContent = document.querySelector("#file-preview-content");
const filePreviewClose = document.querySelector("#file-preview-close");
const filePreviewOpen = document.querySelector("#file-preview-open");
const filePreviewRename = document.querySelector("#file-preview-rename");
const filePreviewMove = document.querySelector("#file-preview-move");
const virtualDialog = document.querySelector("#virtual-dialog");
const virtualDialogTitle = document.querySelector("#virtual-dialog-title");
const virtualDialogForm = document.querySelector("#virtual-dialog-form");
const virtualDialogLabel = document.querySelector("#virtual-dialog-label");
const virtualDialogInput = document.querySelector("#virtual-dialog-input");
const virtualDialogSelect = document.querySelector("#virtual-dialog-select");
const virtualDialogCancel = document.querySelector("#virtual-dialog-cancel");
const filesMinimizeButton = document.querySelector("#files-minimize");
const filesCloseButton = document.querySelector("#files-close");
const gamesMinimizeButton = document.querySelector("#games-minimize");
const gamesCloseButton = document.querySelector("#games-close");
const guessForm = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess-input");
const guessSubmit = document.querySelector("#guess-submit");
const guessCount = document.querySelector("#guess-count");
const gameFeedback = document.querySelector("#game-feedback");
const guessRestart = document.querySelector("#guess-restart");

let computerTaskbarButton = null;
let computerIsMinimized = false;
let settingsTaskbarButton = null;
let settingsIsMinimized = false;
let filesTaskbarButton = null;
let filesIsMinimized = false;
let gamesTaskbarButton = null;
let gamesIsMinimized = false;
let secretNumber = 0;
let guessAttempts = 0;
let gameIsWon = false;
const filesPathStack = [];
const notepadInstances = new Set();
let notepadWindowCounter = 0;
let filePreviewDocumentId = null;
let resolveVirtualDialog = null;
const wallpaperStorageKey = "pixelos98.wallpaper";
const defaultWallpaper = "teal";
const availableWallpapers = new Set(["teal", "purple", "blue"]);
const simulatedFileSystem = {
  name: "Meu Computador",
  type: "folder",
  children: [
    {
      name: "README.txt",
      type: "file",
      content: "Bem-vindo ao PixelOS 98!\n\nEste é um explorador de arquivos fictício criado para a simulação.\nOs itens exibidos não são arquivos reais do computador.",
    },
    {
      name: "diario.txt",
      type: "file",
      content: "Diário PixelOS\n\nHoje explorei um computador cheio de pixels e boas lembranças.\n\nFim da anotação.",
    },
    {
      name: "fotos",
      type: "folder",
      children: [
        {
          name: "lembrancas.txt",
          type: "file",
          content: "Álbum de lembranças\n\n1. Um fim de tarde em 1998.\n2. A primeira partida com amigos.\n\n(Imagens de demonstração não incluídas.)",
        },
        {
          name: "album-vazio",
          type: "folder",
          children: [],
        },
      ],
    },
    {
      name: "jogos",
      type: "folder",
      children: [
        {
          name: "pontuacoes.txt",
          type: "file",
          content: "Placar de demonstração\n\nPixel Racer: 1200 pontos\nBlocos: 980 pontos\n\nContinue jogando!",
        },
      ],
    },
  ],
};

function updateClock() {
  if (!clock) {
    return;
  }

  const now = new Date();
  clock.dateTime = now.toISOString();
  clock.textContent = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}

updateClock();
window.setInterval(updateClock, 1000);

function setAboutVisible(isVisible) {
  if (!aboutButton || !aboutPanel) {
    return;
  }

  aboutPanel.hidden = !isVisible;
  aboutButton.setAttribute("aria-expanded", String(isVisible));
}

function openComputer() {
  if (!computerWindow || !taskbarApps) {
    return;
  }

  if (!computerTaskbarButton) {
    computerTaskbarButton = document.createElement("button");
    computerTaskbarButton.className = "taskbar-app-button";
    computerTaskbarButton.type = "button";
    computerTaskbarButton.textContent = "Meu Computador";
    computerTaskbarButton.setAttribute("aria-label", "Alternar Meu Computador");
    computerTaskbarButton.addEventListener("click", toggleComputerWindow);
    taskbarApps.append(computerTaskbarButton);
  }

  computerWindow.hidden = false;
  computerWindow.setAttribute("aria-hidden", "false");
  computerIsMinimized = false;
  computerTaskbarButton.setAttribute("aria-pressed", "true");
}

function minimizeComputer() {
  if (!computerWindow || !computerTaskbarButton) {
    return;
  }

  computerWindow.hidden = true;
  computerWindow.setAttribute("aria-hidden", "true");
  computerIsMinimized = true;
  computerTaskbarButton.setAttribute("aria-pressed", "false");
}

function toggleComputerWindow() {
  if (computerWindow?.hidden && computerIsMinimized) {
    openComputer();
    return;
  }

  if (computerWindow && !computerWindow.hidden) {
    minimizeComputer();
    return;
  }

  openComputer();
}

function closeComputer() {
  if (!computerWindow) {
    return;
  }

  computerWindow.hidden = true;
  computerWindow.setAttribute("aria-hidden", "true");
  computerIsMinimized = false;
  computerTaskbarButton?.remove();
  computerTaskbarButton = null;
  setAboutVisible(false);
}

function setNotepadStatus(instance, message, state = "saved") {
  instance.status.textContent = message;
  instance.status.dataset.state = state;
}

function finishVirtualDialog(value) {
  if (!resolveVirtualDialog) {
    return;
  }
  const resolve = resolveVirtualDialog;
  resolveVirtualDialog = null;
  virtualDialog.hidden = true;
  resolve(value);
}

function requestVirtualDialog({ title, label, value = "", choices = null }) {
  if (!virtualDialog || !virtualDialogForm) {
    return Promise.resolve(null);
  }
  virtualDialogTitle.textContent = title;
  virtualDialogLabel.textContent = label;
  virtualDialogLabel.htmlFor = choices ? "virtual-dialog-select" : "virtual-dialog-input";
  virtualDialogInput.hidden = Boolean(choices);
  virtualDialogInput.required = !choices;
  virtualDialogSelect.hidden = !choices;
  virtualDialogSelect.required = Boolean(choices);
  virtualDialogSelect.replaceChildren();
  if (choices) {
    choices.forEach((choice) => {
      const option = document.createElement("option");
      option.value = choice.value;
      option.textContent = choice.label;
      virtualDialogSelect.append(option);
    });
    virtualDialogSelect.value = value || choices[0]?.value || "";
  } else {
    virtualDialogInput.value = value;
  }
  virtualDialog.hidden = false;
  return new Promise((resolve) => {
    resolveVirtualDialog = resolve;
    (choices ? virtualDialogSelect : virtualDialogInput).focus();
  });
}

function refreshNotepadTitle(instance) {
  const documentName = instance.documentId ? virtualFiles.getDocument(instance.documentId)?.name : null;
  const dirty = instance.editor.value !== instance.savedContent;
  instance.title.textContent = `${documentName || "Bloco de Notas"}${dirty ? " *" : ""}`;
  setNotepadStatus(instance, dirty ? "Alterações não salvas" : (documentName ? "Salvo neste dispositivo" : "Documento novo"), dirty ? "pending" : "saved");
}

function confirmDiscardChanges(instance) {
  if (instance.editor.value === instance.savedContent) {
    return true;
  }
  return window.confirm("Há alterações não salvas. Deseja descartá-las?");
}

function activateNotepad(instance) {
  instance.window.hidden = false;
  instance.window.setAttribute("aria-hidden", "false");
  instance.isMinimized = false;
  instance.taskbarButton.setAttribute("aria-pressed", "true");
  instance.window.style.zIndex = String(10 + notepadInstances.size);
}

function closeNotepad(instance) {
  if (!confirmDiscardChanges(instance)) {
    return;
  }
  instance.window.remove();
  instance.taskbarButton.remove();
  notepadInstances.delete(instance);
}

function minimizeNotepad(instance) {
  instance.window.hidden = true;
  instance.window.setAttribute("aria-hidden", "true");
  instance.isMinimized = true;
  instance.taskbarButton.setAttribute("aria-pressed", "false");
}

function updateNotepadFromDocument(instance, savedDocument) {
  instance.documentId = savedDocument.id;
  instance.savedContent = savedDocument.content;
  instance.editor.value = savedDocument.content;
  instance.title.textContent = savedDocument.name;
  setNotepadStatus(instance, "Documento aberto");
  instance.editor.focus();
}

async function getDestinationFolder() {
  const folders = virtualFiles.listFolders();
  const selectedFolderId = await requestVirtualDialog({
    title: "Escolher pasta",
    label: "Pasta de destino",
    value: virtualFiles.documentsFolderId,
    choices: folders.map((folder) => ({ value: folder.id, label: folder.name })),
  });
  if (selectedFolderId === null) {
    return null;
  }
  return virtualFiles.getFolder(selectedFolderId);
}

async function saveNotepad(instance, saveAs = false) {
  const current = instance.documentId ? virtualFiles.getDocument(instance.documentId) : null;
  const needsSaveAs = saveAs || !current;
  let name = current?.name;
  let folderId = current?.folderId;

  if (needsSaveAs) {
    name = await requestVirtualDialog({
      title: "Salvar documento",
      label: "Nome do documento",
      value: current?.name || "Sem título.txt",
    });
    if (name === null) {
      return;
    }
    name = name.trim();
    if (!name) {
      setNotepadStatus(instance, "Digite um nome para o documento", "error");
      return;
    }
    const folder = await getDestinationFolder();
    if (!folder) {
      return;
    }
    folderId = folder.id;
  }

  try {
    const savedDocument = needsSaveAs
      ? virtualFiles.createDocument({ name, content: instance.editor.value, folderId })
      : virtualFiles.updateDocument(current.id, { content: instance.editor.value });
    instance.documentId = savedDocument.id;
    instance.savedContent = savedDocument.content;
    instance.title.textContent = savedDocument.name;
    setNotepadStatus(instance, needsSaveAs ? "Cópia salva neste dispositivo" : "Salvo neste dispositivo");
  } catch (error) {
    console.error("Não foi possível salvar o documento.", error);
    setNotepadStatus(instance, "Não foi possível salvar; verifique o armazenamento", "error");
  }
}

async function chooseDocumentToOpen(instance) {
  const documents = virtualFiles.listDocuments();
  if (documents.length === 0) {
    setNotepadStatus(instance, "Não há documentos salvos para abrir", "error");
    return;
  }
  const selectedId = await requestVirtualDialog({
    title: "Abrir documento",
    label: "Documento salvo",
    value: documents[0].id,
    choices: documents.map((savedDocument) => {
    const folder = virtualFiles.getFolder(savedDocument.folderId);
      return { value: savedDocument.id, label: `${savedDocument.name} (${folder?.name || "Pasta desconhecida"})` };
    }),
  });
  if (selectedId === null) {
    return;
  }
  if (confirmDiscardChanges(instance)) {
    const selectedDocument = virtualFiles.getDocument(selectedId);
    if (selectedDocument) {
      updateNotepadFromDocument(instance, selectedDocument);
    }
  }
}

async function exportNotepad(instance) {
  let filename = instance.documentId ? virtualFiles.getDocument(instance.documentId)?.name : null;
  if (!filename) {
    filename = await requestVirtualDialog({
      title: "Exportar arquivo",
      label: "Nome do arquivo .txt",
      value: "Sem título.txt",
    });
  }
  if (filename === null || filename === "") {
    return;
  }
  filename = filename.trim();
  if (!filename) {
    setNotepadStatus(instance, "Digite um nome para o arquivo", "error");
    return;
  }
  if (!filename.toLocaleLowerCase().endsWith(".txt")) {
    filename += ".txt";
  }

  try {
    const blob = new Blob([instance.editor.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/[\\/:*?"<>|]/g, "_");
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setNotepadStatus(instance, "Arquivo .txt exportado");
  } catch (error) {
    console.error("Não foi possível exportar o documento.", error);
    setNotepadStatus(instance, "Não foi possível exportar o arquivo .txt", "error");
  }
}

function createNotepadInstance(openDocument = null) {
  if (!notepadTemplate || !taskbarApps) {
    return null;
  }
  notepadWindowCounter += 1;
  const notepad = notepadWindowCounter === 1
    ? notepadWindow
    : notepadTemplate.cloneNode(true);
  if (notepadWindowCounter > 1) {
    const idMap = new Map();
    notepad.id = `notepad-window-${notepadWindowCounter}`;
    notepad.querySelectorAll("[id]").forEach((element) => {
      const oldId = element.id;
      const newId = `${oldId}-${notepadWindowCounter}`;
      idMap.set(oldId, newId);
      element.id = newId;
    });
    notepad.querySelectorAll("[for], [aria-labelledby]").forEach((element) => {
      ["for", "aria-labelledby"].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (value && idMap.has(value)) {
          element.setAttribute(attribute, idMap.get(value));
        }
      });
    });
    desktop.append(notepad);
  }

  const instance = {
    window: notepad,
    editor: notepad.querySelector(".notepad-editor"),
    status: notepad.querySelector(".notepad-save-status"),
    title: notepad.querySelector(".window-titlebar > span:nth-child(2)"),
    documentId: null,
    savedContent: "",
    isMinimized: false,
    taskbarButton: document.createElement("button"),
  };
  instance.taskbarButton.className = "taskbar-app-button";
  instance.taskbarButton.type = "button";
  instance.taskbarButton.textContent = "Bloco de Notas";
  instance.taskbarButton.setAttribute("aria-label", "Alternar Bloco de Notas");
  instance.taskbarButton.addEventListener("click", () => {
    if (instance.isMinimized) {
      activateNotepad(instance);
    } else {
      minimizeNotepad(instance);
    }
  });
  taskbarApps.append(instance.taskbarButton);
  notepadInstances.add(instance);

  notepad.querySelector(".minimize-control").addEventListener("click", () => minimizeNotepad(instance));
  notepad.querySelector(".close-control").addEventListener("click", () => closeNotepad(instance));
  notepad.querySelector("#notepad-new, [id^='notepad-new-']").addEventListener("click", () => {
    if (confirmDiscardChanges(instance)) {
      instance.editor.value = "";
      instance.documentId = null;
      instance.savedContent = "";
      refreshNotepadTitle(instance);
      instance.editor.focus();
    }
  });
  notepad.querySelector("#notepad-open, [id^='notepad-open-']").addEventListener("click", () => {
    if (confirmDiscardChanges(instance)) {
      chooseDocumentToOpen(instance);
    }
  });
  notepad.querySelector("#notepad-save, [id^='notepad-save-']").addEventListener("click", () => saveNotepad(instance));
  notepad.querySelector("#notepad-save-as, [id^='notepad-save-as-']").addEventListener("click", () => saveNotepad(instance, true));
  notepad.querySelector("#notepad-export, [id^='notepad-export-']").addEventListener("click", () => exportNotepad(instance));
  notepad.querySelector("#notepad-clear, [id^='notepad-clear-']").addEventListener("click", () => {
    if (confirmDiscardChanges(instance)) {
      instance.editor.value = "";
      instance.documentId = null;
      instance.savedContent = "";
      refreshNotepadTitle(instance);
    }
  });
  instance.editor.addEventListener("input", () => refreshNotepadTitle(instance));
  instance.editor.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveNotepad(instance);
    }
  });
  if (openDocument) {
    updateNotepadFromDocument(instance, openDocument);
  } else if (virtualFiles.storageWarning) {
    setNotepadStatus(instance, virtualFiles.storageWarning, "error");
  } else {
    refreshNotepadTitle(instance);
  }
  activateNotepad(instance);
  return instance;
}

function openNotepad() {
  const existing = Array.from(notepadInstances).pop();
  if (existing) {
    activateNotepad(existing);
  } else {
    createNotepadInstance();
  }
}

function openDocumentInNotepad(documentId) {
  const savedDocument = virtualFiles.getDocument(documentId);
  if (savedDocument) {
    createNotepadInstance(savedDocument);
  }
}

function migrateLegacyNotepad() {
  try {
    const oldText = window.localStorage.getItem("pixelos98.notepad.text");
    if (oldText !== null && virtualFiles.listDocuments().length === 0) {
      virtualFiles.createDocument({
        name: "Documento recuperado.txt",
        content: oldText,
        folderId: virtualFiles.documentsFolderId,
      });
      window.localStorage.removeItem("pixelos98.notepad.text");
    }
  } catch (error) {
    console.error("Não foi possível migrar o texto antigo do Bloco de Notas.", error);
  }
}

function setWallpaper(wallpaper) {
  if (!desktop || !availableWallpapers.has(wallpaper)) {
    return;
  }

  desktop.dataset.wallpaper = wallpaper;
  wallpaperOptions.forEach((option) => {
    option.setAttribute("aria-pressed", String(option.dataset.wallpaperOption === wallpaper));
  });
}

function loadWallpaper() {
  let wallpaper = defaultWallpaper;

  try {
    const savedWallpaper = window.localStorage.getItem(wallpaperStorageKey);
    if (savedWallpaper !== null && availableWallpapers.has(savedWallpaper)) {
      wallpaper = savedWallpaper;
    }
  } catch (error) {
    console.error("Não foi possível recuperar o papel de parede.", error);
    if (settingsSaveStatus) {
      settingsSaveStatus.textContent = "Não foi possível ler a preferência salva";
      settingsSaveStatus.dataset.state = "error";
    }
  }

  setWallpaper(wallpaper);
}

function selectWallpaper(wallpaper) {
  if (!availableWallpapers.has(wallpaper)) {
    return;
  }

  setWallpaper(wallpaper);

  try {
    window.localStorage.setItem(wallpaperStorageKey, wallpaper);
    if (settingsSaveStatus) {
      settingsSaveStatus.textContent = "Tema salvo neste dispositivo";
      settingsSaveStatus.dataset.state = "saved";
    }
  } catch (error) {
    console.error("Não foi possível salvar o papel de parede.", error);
    if (settingsSaveStatus) {
      settingsSaveStatus.textContent = "Tema aplicado, mas não foi possível salvar";
      settingsSaveStatus.dataset.state = "error";
    }
  }
}

function openSettings() {
  if (!settingsWindow || !taskbarApps) {
    return;
  }

  if (!settingsTaskbarButton) {
    settingsTaskbarButton = document.createElement("button");
    settingsTaskbarButton.className = "taskbar-app-button";
    settingsTaskbarButton.type = "button";
    settingsTaskbarButton.textContent = "Configurações";
    settingsTaskbarButton.setAttribute("aria-label", "Alternar Configurações");
    settingsTaskbarButton.addEventListener("click", toggleSettingsWindow);
    taskbarApps.append(settingsTaskbarButton);
  }

  settingsWindow.hidden = false;
  settingsWindow.setAttribute("aria-hidden", "false");
  settingsIsMinimized = false;
  settingsTaskbarButton.setAttribute("aria-pressed", "true");
}

function minimizeSettings() {
  if (!settingsWindow || !settingsTaskbarButton) {
    return;
  }

  settingsWindow.hidden = true;
  settingsWindow.setAttribute("aria-hidden", "true");
  settingsIsMinimized = true;
  settingsTaskbarButton.setAttribute("aria-pressed", "false");
}

function toggleSettingsWindow() {
  if (settingsWindow?.hidden && settingsIsMinimized) {
    openSettings();
    return;
  }

  if (settingsWindow && !settingsWindow.hidden) {
    minimizeSettings();
    return;
  }

  openSettings();
}

function closeSettings() {
  if (!settingsWindow) {
    return;
  }

  settingsWindow.hidden = true;
  settingsWindow.setAttribute("aria-hidden", "true");
  settingsIsMinimized = false;
  settingsTaskbarButton?.remove();
  settingsTaskbarButton = null;
}

function getCurrentFolder() {
  const current = filesPathStack[filesPathStack.length - 1];
  if (current?.virtualFolderId) {
    const folder = virtualFiles.getFolder(current.virtualFolderId);
    if (!folder) {
      return { name: current.name, type: "folder", children: [] };
    }
    const folders = virtualFiles.listFolders()
      .filter((item) => item.parentId === folder.id)
      .map((item) => ({ name: item.name, type: "folder", children: [], virtualFolderId: item.id }));
    const documents = virtualFiles.listDocuments(folder.id)
      .map((item) => ({ name: item.name, type: "virtual-document", content: item.content, documentId: item.id }));
    return { name: folder.name, type: "folder", children: [...folders, ...documents] };
  }
  if (current) {
    return current.folder;
  }
  const virtualFolderEntry = virtualFiles.listFolders()
    .filter((folder) => folder.parentId === virtualFiles.rootFolderId)
    .map((folder) => ({ name: folder.name, type: "folder", children: [], virtualFolderId: folder.id }));
  const rootDocuments = virtualFiles.listDocuments(virtualFiles.rootFolderId)
    .map((item) => ({ name: item.name, type: "virtual-document", content: item.content, documentId: item.id }));
  return { ...simulatedFileSystem, children: [...simulatedFileSystem.children, ...virtualFolderEntry, ...rootDocuments] };
}

function closeFilePreview() {
  if (filePreview) {
    filePreview.hidden = true;
  }
  filePreviewDocumentId = null;
}

function showFilePreview(file) {
  if (!filePreview || !filePreviewTitle || !filePreviewContent) {
    return;
  }

  filePreviewTitle.textContent = file.name;
  filePreviewContent.textContent = file.content;
  filePreviewDocumentId = file.type === "virtual-document" ? file.documentId : null;
  [filePreviewOpen, filePreviewRename, filePreviewMove].forEach((button) => {
    if (button) {
      button.hidden = filePreviewDocumentId === null;
    }
  });
  filePreview.hidden = false;
}

function openFileEntry(entry) {
  if (entry.type === "virtual-document") {
    showFilePreview(entry);
    return;
  }
  if (entry.type === "folder") {
    filesPathStack.push({ name: entry.name, folder: entry, virtualFolderId: entry.virtualFolderId || null });
    renderFilesFolder();
    return;
  }

  showFilePreview(entry);
}

function renderFilesFolder() {
  if (!filesList || !filesPath || !filesBackButton) {
    return;
  }

  const currentFolder = getCurrentFolder();
  filesPath.textContent = ["Meu Computador", ...filesPathStack.map((item) => item.name)].join(" > ");
  filesBackButton.disabled = filesPathStack.length === 0;
  filesList.replaceChildren();
  closeFilePreview();

  if (currentFolder.children.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-folder";
    emptyMessage.textContent = "Esta pasta está vazia.";
    filesList.append(emptyMessage);
    return;
  }

  currentFolder.children.forEach((entry) => {
    const entryButton = document.createElement("button");
    const icon = document.createElement("span");
    const name = document.createElement("span");

    entryButton.className = "file-entry";
    entryButton.type = "button";
    entryButton.setAttribute("aria-label", `${entry.type === "folder" ? "Pasta" : "Arquivo"}: ${entry.name}`);
    icon.className = `file-entry-icon ${entry.type === "folder" ? "folder" : "document"}`;
    icon.setAttribute("aria-hidden", "true");
    name.textContent = entry.name;
    entryButton.append(icon, name);
    entryButton.addEventListener("click", () => openFileEntry(entry));
    if (entry.type === "virtual-document") {
      entryButton.addEventListener("dblclick", () => openDocumentInNotepad(entry.documentId));
    }
    filesList.append(entryButton);
  });
}

function openPreviewedDocument() {
  if (filePreviewDocumentId) {
    openDocumentInNotepad(filePreviewDocumentId);
  }
}

async function renamePreviewedDocument() {
  const savedDocument = filePreviewDocumentId ? virtualFiles.getDocument(filePreviewDocumentId) : null;
  if (!savedDocument) {
    return;
  }
  const name = await requestVirtualDialog({
    title: "Renomear documento",
    label: "Novo nome",
    value: savedDocument.name,
  });
  if (name === null || !name.trim()) {
    return;
  }
  try {
    virtualFiles.updateDocument(savedDocument.id, { name: name.trim() });
  } catch (error) {
    console.error("Não foi possível renomear o documento.", error);
    filePreviewTitle.textContent = `Erro ao renomear: ${error.message}`;
  }
}

async function movePreviewedDocument() {
  const savedDocument = filePreviewDocumentId ? virtualFiles.getDocument(filePreviewDocumentId) : null;
  if (!savedDocument) {
    return;
  }
  const folder = await getDestinationFolder();
  if (!folder) {
    return;
  }
  try {
    virtualFiles.updateDocument(savedDocument.id, { folderId: folder.id });
  } catch (error) {
    console.error("Não foi possível mover o documento.", error);
    filePreviewTitle.textContent = `Erro ao mover: ${error.message}`;
  }
}

function openFiles() {
  if (!filesWindow || !taskbarApps) {
    return;
  }

  if (!filesTaskbarButton) {
    filesTaskbarButton = document.createElement("button");
    filesTaskbarButton.className = "taskbar-app-button";
    filesTaskbarButton.type = "button";
    filesTaskbarButton.textContent = "Arquivos";
    filesTaskbarButton.setAttribute("aria-label", "Alternar Arquivos");
    filesTaskbarButton.addEventListener("click", toggleFilesWindow);
    taskbarApps.append(filesTaskbarButton);
  }

  filesWindow.hidden = false;
  filesWindow.setAttribute("aria-hidden", "false");
  filesIsMinimized = false;
  filesTaskbarButton.setAttribute("aria-pressed", "true");
  renderFilesFolder();
}

function minimizeFiles() {
  if (!filesWindow || !filesTaskbarButton) {
    return;
  }

  filesWindow.hidden = true;
  filesWindow.setAttribute("aria-hidden", "true");
  filesIsMinimized = true;
  filesTaskbarButton.setAttribute("aria-pressed", "false");
}

function toggleFilesWindow() {
  if (filesWindow?.hidden && filesIsMinimized) {
    openFiles();
    return;
  }

  if (filesWindow && !filesWindow.hidden) {
    minimizeFiles();
    return;
  }

  openFiles();
}

function closeFiles() {
  if (!filesWindow) {
    return;
  }

  filesWindow.hidden = true;
  filesWindow.setAttribute("aria-hidden", "true");
  filesIsMinimized = false;
  filesTaskbarButton?.remove();
  filesTaskbarButton = null;
}

function goBackInFiles() {
  if (filesPathStack.length === 0) {
    return;
  }

  filesPathStack.pop();
  renderFilesFolder();
}

function setGameFeedback(message, state = "playing") {
  if (!gameFeedback) {
    return;
  }

  gameFeedback.textContent = message;
  gameFeedback.dataset.state = state;
}

function restartGuessGame() {
  secretNumber = Math.floor(Math.random() * 100) + 1;
  guessAttempts = 0;
  gameIsWon = false;

  if (guessCount) {
    guessCount.textContent = String(guessAttempts);
  }
  if (guessInput) {
    guessInput.value = "";
    guessInput.disabled = false;
  }
  if (guessSubmit) {
    guessSubmit.disabled = false;
  }

  setGameFeedback("Digite um número inteiro entre 1 e 100.");
  guessInput?.focus();
}

function submitGuess(event) {
  event.preventDefault();

  if (!guessInput || gameIsWon) {
    return;
  }

  const rawGuess = guessInput.value.trim();
  const guess = Number(rawGuess);
  if (rawGuess === "" || !Number.isInteger(guess) || guess < 1 || guess > 100) {
    setGameFeedback("Palpite inválido. Digite um número inteiro de 1 a 100.", "error");
    guessInput.focus();
    return;
  }

  guessAttempts += 1;
  if (guessCount) {
    guessCount.textContent = String(guessAttempts);
  }

  if (guess === secretNumber) {
    gameIsWon = true;
    setGameFeedback(`Você acertou! O número era ${secretNumber}. Vitória em ${guessAttempts} ${guessAttempts === 1 ? "tentativa" : "tentativas"}!`, "win");
    guessInput.disabled = true;
    if (guessSubmit) {
      guessSubmit.disabled = true;
    }
    guessRestart?.focus();
    return;
  }

  setGameFeedback(
    guess < secretNumber ? "O número secreto é MAIOR. Tente novamente!" : "O número secreto é MENOR. Tente novamente!",
  );
  guessInput.value = "";
  guessInput.focus();
}

function openGames() {
  if (!gamesWindow || !taskbarApps) {
    return;
  }

  if (!gamesTaskbarButton) {
    gamesTaskbarButton = document.createElement("button");
    gamesTaskbarButton.className = "taskbar-app-button";
    gamesTaskbarButton.type = "button";
    gamesTaskbarButton.textContent = "Jogos";
    gamesTaskbarButton.setAttribute("aria-label", "Alternar Jogos");
    gamesTaskbarButton.addEventListener("click", toggleGamesWindow);
    taskbarApps.append(gamesTaskbarButton);
  }

  gamesWindow.hidden = false;
  gamesWindow.setAttribute("aria-hidden", "false");
  gamesIsMinimized = false;
  gamesTaskbarButton.setAttribute("aria-pressed", "true");
}

function minimizeGames() {
  if (!gamesWindow || !gamesTaskbarButton) {
    return;
  }

  gamesWindow.hidden = true;
  gamesWindow.setAttribute("aria-hidden", "true");
  gamesIsMinimized = true;
  gamesTaskbarButton.setAttribute("aria-pressed", "false");
}

function toggleGamesWindow() {
  if (gamesWindow?.hidden && gamesIsMinimized) {
    openGames();
    return;
  }

  if (gamesWindow && !gamesWindow.hidden) {
    minimizeGames();
    return;
  }

  openGames();
}

function closeGames() {
  if (!gamesWindow) {
    return;
  }

  gamesWindow.hidden = true;
  gamesWindow.setAttribute("aria-hidden", "true");
  gamesIsMinimized = false;
  gamesTaskbarButton?.remove();
  gamesTaskbarButton = null;
}

migrateLegacyNotepad();
loadWallpaper();
restartGuessGame();

computerIcon?.addEventListener("click", openComputer);
minimizeButton?.addEventListener("click", minimizeComputer);
closeButton?.addEventListener("click", closeComputer);
notepadIcon?.addEventListener("click", openNotepad);
settingsIcon?.addEventListener("click", openSettings);
settingsMinimizeButton?.addEventListener("click", minimizeSettings);
settingsCloseButton?.addEventListener("click", closeSettings);
filesIcon?.addEventListener("click", openFiles);
filesMinimizeButton?.addEventListener("click", minimizeFiles);
filesCloseButton?.addEventListener("click", closeFiles);
filesBackButton?.addEventListener("click", goBackInFiles);
filePreviewClose?.addEventListener("click", closeFilePreview);
filePreviewOpen?.addEventListener("click", openPreviewedDocument);
filePreviewRename?.addEventListener("click", renamePreviewedDocument);
filePreviewMove?.addEventListener("click", movePreviewedDocument);
virtualDialogForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  finishVirtualDialog(virtualDialogSelect.hidden ? virtualDialogInput.value : virtualDialogSelect.value);
});
virtualDialogCancel?.addEventListener("click", () => finishVirtualDialog(null));
virtualDialog?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    finishVirtualDialog(null);
  }
});
gamesIcon?.addEventListener("click", openGames);
gamesMinimizeButton?.addEventListener("click", minimizeGames);
gamesCloseButton?.addEventListener("click", closeGames);
guessForm?.addEventListener("submit", submitGuess);
guessRestart?.addEventListener("click", restartGuessGame);
wallpaperOptions.forEach((option) => {
  option.addEventListener("click", () => selectWallpaper(option.dataset.wallpaperOption));
});

virtualFiles.subscribe(() => {
  if (filesWindow && !filesWindow.hidden) {
    renderFilesFolder();
  }
  notepadInstances.forEach((instance) => {
    if (instance.documentId && instance.editor.value === instance.savedContent) {
      const updated = virtualFiles.getDocument(instance.documentId);
      if (updated) {
        instance.savedContent = updated.content;
        instance.editor.value = updated.content;
        instance.title.textContent = updated.name;
        setNotepadStatus(instance, "Documento atualizado");
      }
    } else if (instance.documentId) {
      refreshNotepadTitle(instance);
    }
  });
});

aboutButton?.addEventListener("click", () => {
  setAboutVisible(aboutPanel?.hidden ?? false);
});

aboutClose?.addEventListener("click", () => setAboutVisible(false));
aboutOk?.addEventListener("click", () => setAboutVisible(false));

desktop?.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && aboutPanel && !aboutPanel.hidden) {
    setAboutVisible(false);
    aboutButton?.focus();
  }
});

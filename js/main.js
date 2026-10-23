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
const notepadEditor = document.querySelector("#notepad-editor");
const notepadStatus = document.querySelector("#notepad-save-status");
const notepadNewButton = document.querySelector("#notepad-new");
const notepadClearButton = document.querySelector("#notepad-clear");
const notepadMinimizeButton = document.querySelector("#notepad-minimize");
const notepadCloseButton = document.querySelector("#notepad-close");
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
let notepadTaskbarButton = null;
let notepadIsMinimized = false;
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
let notepadSaveTimer = 0;

const notepadStorageKey = "pixelos98.notepad.text";
const notepadSaveDelay = 500;
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

function setNotepadStatus(message, state = "saved") {
  if (!notepadStatus) {
    return;
  }

  notepadStatus.textContent = message;
  notepadStatus.dataset.state = state;
}

function saveNotepad() {
  if (!notepadEditor) {
    return;
  }

  window.clearTimeout(notepadSaveTimer);
  notepadSaveTimer = 0;

  try {
    window.localStorage.setItem(notepadStorageKey, notepadEditor.value);
    setNotepadStatus("Salvo neste dispositivo");
  } catch (error) {
    console.error("Não foi possível salvar o Bloco de Notas.", error);
    setNotepadStatus("Não foi possível salvar localmente", "error");
  }
}

function scheduleNotepadSave() {
  if (!notepadEditor) {
    return;
  }

  window.clearTimeout(notepadSaveTimer);
  setNotepadStatus("Salvando...", "pending");
  notepadSaveTimer = window.setTimeout(saveNotepad, notepadSaveDelay);
}

function loadNotepad() {
  if (!notepadEditor) {
    return;
  }

  try {
    const savedText = window.localStorage.getItem(notepadStorageKey);
    if (savedText !== null) {
      notepadEditor.value = savedText;
      setNotepadStatus("Texto recuperado");
    }
  } catch (error) {
    console.error("Não foi possível recuperar o Bloco de Notas.", error);
    setNotepadStatus("Não foi possível ler o salvamento local", "error");
  }
}

function openNotepad() {
  if (!notepadWindow || !taskbarApps) {
    return;
  }

  if (!notepadTaskbarButton) {
    notepadTaskbarButton = document.createElement("button");
    notepadTaskbarButton.className = "taskbar-app-button";
    notepadTaskbarButton.type = "button";
    notepadTaskbarButton.textContent = "Bloco de Notas";
    notepadTaskbarButton.setAttribute("aria-label", "Alternar Bloco de Notas");
    notepadTaskbarButton.addEventListener("click", toggleNotepadWindow);
    taskbarApps.append(notepadTaskbarButton);
  }

  notepadWindow.hidden = false;
  notepadWindow.setAttribute("aria-hidden", "false");
  notepadIsMinimized = false;
  notepadTaskbarButton.setAttribute("aria-pressed", "true");
}

function minimizeNotepad() {
  if (!notepadWindow || !notepadTaskbarButton) {
    return;
  }

  notepadWindow.hidden = true;
  notepadWindow.setAttribute("aria-hidden", "true");
  notepadIsMinimized = true;
  notepadTaskbarButton.setAttribute("aria-pressed", "false");
}

function toggleNotepadWindow() {
  if (notepadWindow?.hidden && notepadIsMinimized) {
    openNotepad();
    return;
  }

  if (notepadWindow && !notepadWindow.hidden) {
    minimizeNotepad();
    return;
  }

  openNotepad();
}

function closeNotepad() {
  if (!notepadWindow) {
    return;
  }

  saveNotepad();
  notepadWindow.hidden = true;
  notepadWindow.setAttribute("aria-hidden", "true");
  notepadIsMinimized = false;
  notepadTaskbarButton?.remove();
  notepadTaskbarButton = null;
}

function clearNotepadAfterConfirmation() {
  if (!notepadEditor || !window.confirm("Deseja apagar o texto do Bloco de Notas?")) {
    return;
  }

  notepadEditor.value = "";
  saveNotepad();
}

function createNewNotepadDocument() {
  if (!notepadEditor) {
    return;
  }

  if (notepadEditor.value.length > 0 && !window.confirm("O texto atual será apagado. Deseja criar um novo documento?")) {
    return;
  }

  notepadEditor.value = "";
  saveNotepad();
  notepadEditor.focus();
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
  return filesPathStack.length > 0
    ? filesPathStack[filesPathStack.length - 1].folder
    : simulatedFileSystem;
}

function closeFilePreview() {
  if (filePreview) {
    filePreview.hidden = true;
  }
}

function showFilePreview(file) {
  if (!filePreview || !filePreviewTitle || !filePreviewContent) {
    return;
  }

  filePreviewTitle.textContent = file.name;
  filePreviewContent.textContent = file.content;
  filePreview.hidden = false;
}

function openFileEntry(entry) {
  if (entry.type === "folder") {
    filesPathStack.push({ name: entry.name, folder: entry });
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
    filesList.append(entryButton);
  });
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

loadNotepad();
loadWallpaper();
restartGuessGame();

computerIcon?.addEventListener("click", openComputer);
minimizeButton?.addEventListener("click", minimizeComputer);
closeButton?.addEventListener("click", closeComputer);
notepadIcon?.addEventListener("click", openNotepad);
settingsIcon?.addEventListener("click", openSettings);
notepadMinimizeButton?.addEventListener("click", minimizeNotepad);
notepadCloseButton?.addEventListener("click", closeNotepad);
settingsMinimizeButton?.addEventListener("click", minimizeSettings);
settingsCloseButton?.addEventListener("click", closeSettings);
filesIcon?.addEventListener("click", openFiles);
filesMinimizeButton?.addEventListener("click", minimizeFiles);
filesCloseButton?.addEventListener("click", closeFiles);
filesBackButton?.addEventListener("click", goBackInFiles);
filePreviewClose?.addEventListener("click", closeFilePreview);
gamesIcon?.addEventListener("click", openGames);
gamesMinimizeButton?.addEventListener("click", minimizeGames);
gamesCloseButton?.addEventListener("click", closeGames);
guessForm?.addEventListener("submit", submitGuess);
guessRestart?.addEventListener("click", restartGuessGame);
notepadEditor?.addEventListener("input", scheduleNotepadSave);
notepadNewButton?.addEventListener("click", createNewNotepadDocument);
notepadClearButton?.addEventListener("click", clearNotepadAfterConfirmation);
wallpaperOptions.forEach((option) => {
  option.addEventListener("click", () => selectWallpaper(option.dataset.wallpaperOption));
});

window.addEventListener("pagehide", () => {
  if (notepadSaveTimer) {
    saveNotepad();
  }
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

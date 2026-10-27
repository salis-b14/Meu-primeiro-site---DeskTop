"use strict";

(() => {
  const storageKey = "pixelos98.virtual-files";
  const rootFolderId = "pixelos98-root";
  const documentsFolderId = "pixelos98-documents";
  const listeners = new Set();

  function createId() {
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function createDefaultState() {
    const now = new Date().toISOString();
    return {
      version: 1,
      folders: [
        { id: rootFolderId, name: "Meu Computador", parentId: null, createdAt: now },
        { id: documentsFolderId, name: "Documentos", parentId: rootFolderId, createdAt: now },
      ],
      documents: [],
    };
  }

  function isValidTimestamp(value) {
    return typeof value === "string" && Number.isFinite(Date.parse(value));
  }

  function normalizeState(value) {
    if (!value || typeof value !== "object" || value.version !== 1
      || !Array.isArray(value.folders) || !Array.isArray(value.documents)) {
      throw new Error("Formato inválido no armazenamento de arquivos virtuais.");
    }

    const state = createDefaultState();
    const folderIds = new Set(state.folders.map((folder) => folder.id));
    const folderNames = new Set([`${rootFolderId}:meu computador`, `${rootFolderId}:documentos`]);

    value.folders.forEach((folder) => {
      if (!folder || typeof folder.id !== "string" || typeof folder.name !== "string"
        || folder.name.trim() === "" || typeof folder.parentId !== "string"
        || !isValidTimestamp(folder.createdAt) || folderIds.has(folder.id)
        || !folderIds.has(folder.parentId)) {
        console.error("Pasta virtual inválida ignorada.", folder);
        return;
      }
      const uniqueName = `${folder.parentId}:${folder.name.trim().toLocaleLowerCase()}`;
      if (folderNames.has(uniqueName)) {
        console.error("Pasta virtual duplicada ignorada.", folder);
        return;
      }
      folderIds.add(folder.id);
      folderNames.add(uniqueName);
      state.folders.push({ ...folder, name: folder.name.trim() });
    });

    const documentIds = new Set();
    value.documents.forEach((document) => {
      if (!document || typeof document.id !== "string" || document.id.trim() === ""
        || documentIds.has(document.id) || typeof document.name !== "string"
        || document.name.trim() === "" || typeof document.content !== "string"
        || typeof document.folderId !== "string" || !folderIds.has(document.folderId)
        || !isValidTimestamp(document.createdAt) || !isValidTimestamp(document.modifiedAt)) {
        console.error("Documento virtual inválido ou duplicado ignorado.", document);
        return;
      }
      documentIds.add(document.id);
      state.documents.push({
        id: document.id,
        name: document.name.trim(),
        content: document.content,
        folderId: document.folderId,
        createdAt: document.createdAt,
        modifiedAt: document.modifiedAt,
      });
    });

    return state;
  }

  let state = createDefaultState();
  let storageWarning = "";
  try {
    const savedState = window.localStorage.getItem(storageKey);
    if (savedState !== null) {
      try {
        state = normalizeState(JSON.parse(savedState));
      } catch (error) {
        console.error("Dados virtuais inválidos; um sistema de arquivos padrão foi iniciado.", error);
        storageWarning = "Os arquivos salvos eram inválidos; o armazenamento foi reiniciado.";
      }
    }
  } catch (error) {
    console.error("Não foi possível ler o armazenamento de arquivos virtuais.", error);
    storageWarning = "Não foi possível ler o armazenamento local.";
  }

  function persist(nextState) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    state = nextState;
    listeners.forEach((listener) => listener());
  }

  function listFolders() {
    return state.folders.map((folder) => ({ ...folder }));
  }

  function listDocuments(folderId) {
    return state.documents
      .filter((document) => folderId === undefined || document.folderId === folderId)
      .map((document) => ({ ...document }));
  }

  function getDocument(id) {
    const found = state.documents.find((document) => document.id === id);
    return found ? { ...found } : null;
  }

  function getFolder(id) {
    const found = state.folders.find((folder) => folder.id === id);
    return found ? { ...found } : null;
  }

  function createDocument({ name, content, folderId }) {
    const cleanName = typeof name === "string" ? name.trim() : "";
    if (!cleanName || typeof content !== "string" || !getFolder(folderId)) {
      throw new Error("Nome, conteúdo ou pasta de destino inválido.");
    }
    const now = new Date().toISOString();
    const document = { id: createId(), name: cleanName, content, folderId, createdAt: now, modifiedAt: now };
    persist({ ...state, documents: [...state.documents, document] });
    return { ...document };
  }

  function updateDocument(id, changes) {
    const current = state.documents.find((document) => document.id === id);
    if (!current) {
      throw new Error("O documento não existe mais.");
    }
    const name = changes.name === undefined ? current.name : changes.name.trim();
    const content = changes.content === undefined ? current.content : changes.content;
    const folderId = changes.folderId === undefined ? current.folderId : changes.folderId;
    if (!name || typeof content !== "string" || !getFolder(folderId)) {
      throw new Error("Nome, conteúdo ou pasta de destino inválido.");
    }
    const updated = { ...current, name, content, folderId, modifiedAt: new Date().toISOString() };
    persist({ ...state, documents: state.documents.map((document) => document.id === id ? updated : document) });
    return { ...updated };
  }

  window.PixelOSVirtualFiles = Object.freeze({
    rootFolderId,
    documentsFolderId,
    get storageWarning() { return storageWarning; },
    listFolders,
    listDocuments,
    getDocument,
    getFolder,
    createDocument,
    updateDocument,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  });
})();

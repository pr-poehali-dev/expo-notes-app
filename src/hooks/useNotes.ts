import { useState } from 'react';
import { Note, Folder } from '@/types/notes';

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const INIT_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Работа', createdAt: new Date().toISOString() },
  { id: 'f2', name: 'Личное', createdAt: new Date().toISOString() },
];

const INIT_NOTES: Note[] = [
  {
    id: 'n1', title: 'Задачи на неделю', content: 'Завершить отчёт\nПозвонить клиенту',
    folderId: 'f1', createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isPinned: true, isDeleted: false,
  },
  {
    id: 'n2', title: 'Рецепт', content: 'Паста, яйца, сыр, перец',
    folderId: 'f2', createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    isPinned: false, isDeleted: false,
  },
];

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(INIT_NOTES);
  const [folders, setFolders] = useState<Folder[]>(INIT_FOLDERS);

  const createNote = (folderId: string | null = null): Note => {
    const note: Note = {
      id: genId(), title: '', content: '', folderId,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      isPinned: false, isDeleted: false,
    };
    setNotes(prev => [note, ...prev]);
    return note;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() } : n)
    );
  };

  const restoreNote = (id: string) => {
    setNotes(prev =>
      prev.map(n => n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n)
    );
  };

  const permanentDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const createFolder = (name: string): Folder => {
    const folder: Folder = { id: genId(), name, createdAt: new Date().toISOString() };
    setFolders(prev => [...prev, folder]);
    return folder;
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: null } : n));
  };

  const renameFolder = (id: string, name: string) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
  };

  return {
    notes, folders,
    createNote, updateNote, deleteNote, restoreNote, permanentDelete,
    createFolder, deleteFolder, renameFolder,
  };
}

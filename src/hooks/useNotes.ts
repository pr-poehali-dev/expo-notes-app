import { useState, useCallback } from 'react';
import { Note, Folder, Tag, AppState } from '@/types/notes';

const TAG_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];

const INITIAL_TAGS: Tag[] = [
  { id: 't1', name: 'важное', color: '#ef4444' },
  { id: 't2', name: 'работа', color: '#3b82f6' },
  { id: 't3', name: 'личное', color: '#10b981' },
];

const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Работа', icon: '💼', color: '#3b82f6', createdAt: new Date().toISOString() },
  { id: 'f2', name: 'Личное', icon: '🏠', color: '#10b981', createdAt: new Date().toISOString() },
  { id: 'f3', name: 'Идеи', icon: '💡', color: '#f59e0b', createdAt: new Date().toISOString() },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1', title: 'Список задач на неделю', content: 'Завершить отчёт\nПозвонить клиенту\nОбновить презентацию',
    folderId: 'f1', tags: ['t1', 't2'], createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(), isPinned: true, isFavorite: false, isArchived: false, isDeleted: false,
  },
  {
    id: 'n2', title: 'Идея нового проекта', content: 'Создать приложение для трекинга привычек с геймификацией',
    folderId: 'f3', tags: ['t3'], createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(), isPinned: false, isFavorite: true, isArchived: false, isDeleted: false,
  },
  {
    id: 'n3', title: 'Рецепт карбонары', content: 'Паста, яйца, гуанчале, пекорино, чёрный перец',
    folderId: 'f2', tags: ['t3'], createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(), isPinned: false, isFavorite: false, isArchived: false, isDeleted: false,
  },
];

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useNotes() {
  const [state, setState] = useState<AppState>({
    notes: INITIAL_NOTES,
    folders: INITIAL_FOLDERS,
    tags: INITIAL_TAGS,
  });

  const createNote = useCallback((folderId: string | null = null): Note => {
    const note: Note = {
      id: genId(), title: '', content: '', folderId, tags: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      isPinned: false, isFavorite: false, isArchived: false, isDeleted: false,
    };
    setState(s => ({ ...s, notes: [note, ...s.notes] }));
    return note;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setState(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() } : n),
    }));
  }, []);

  const restoreNote = useCallback((id: string) => {
    setState(s => ({
      ...s,
      notes: s.notes.map(n => n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n),
    }));
  }, []);

  const permanentDelete = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
  }, []);

  const createFolder = useCallback((name: string, icon: string = '📁', color: string = '#f59e0b') => {
    const folder: Folder = { id: genId(), name, icon, color, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, folders: [...s.folders, folder] }));
    return folder;
  }, []);

  const deleteFolder = useCallback((id: string) => {
    setState(s => ({
      ...s,
      folders: s.folders.filter(f => f.id !== id),
      notes: s.notes.map(n => n.folderId === id ? { ...n, folderId: null } : n),
    }));
  }, []);

  const createTag = useCallback((name: string) => {
    const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const tag: Tag = { id: genId(), name, color };
    setState(s => ({ ...s, tags: [...s.tags, tag] }));
    return tag;
  }, []);

  return {
    ...state,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentDelete,
    createFolder,
    deleteFolder,
    createTag,
  };
}

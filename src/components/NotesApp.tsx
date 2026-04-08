import { useState, useMemo } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Note, SidebarSection } from '@/types/notes';
import NoteCard from '@/components/NoteCard';
import NoteEditor from '@/components/NoteEditor';
import SideDrawer from '@/components/SideDrawer';
import Icon from '@/components/ui/icon';

const FOLDER_ICONS = ['📁', '💼', '🏠', '💡', '📚', '🎨', '🚀', '❤️', '🎯', '🌿'];
const FOLDER_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

export default function NotesApp() {
  const {
    notes, folders, tags,
    createNote, updateNote, deleteNote, restoreNote, permanentDelete,
    createFolder, deleteFolder, createTag,
  } = useNotes();

  const [activeSection, setActiveSection] = useState<SidebarSection>('all');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  const counts = useMemo(() => ({
    all: notes.filter(n => !n.isDeleted && !n.isArchived).length,
    pinned: notes.filter(n => !n.isDeleted && n.isPinned).length,
    favorites: notes.filter(n => !n.isDeleted && n.isFavorite).length,
    archive: notes.filter(n => !n.isDeleted && n.isArchived).length,
    trash: notes.filter(n => n.isDeleted).length,
    folders: folders.length,
  }), [notes, folders]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (activeFolderId) {
      result = result.filter(n => n.folderId === activeFolderId && !n.isDeleted);
    } else {
      switch (activeSection) {
        case 'all': result = result.filter(n => !n.isDeleted && !n.isArchived); break;
        case 'pinned': result = result.filter(n => n.isPinned && !n.isDeleted); break;
        case 'favorites': result = result.filter(n => n.isFavorite && !n.isDeleted); break;
        case 'archive': result = result.filter(n => n.isArchived && !n.isDeleted); break;
        case 'trash': result = result.filter(n => n.isDeleted); break;
        default: result = result.filter(n => !n.isDeleted && !n.isArchived);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        tags.filter(t => n.tags.includes(t.id)).some(t => t.name.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, activeSection, activeFolderId, search, tags]);

  const handleCreateNote = () => {
    const note = createNote(activeFolderId);
    setSelectedNote(note);
  };

  const handleCreateFolder = () => setShowNewFolder(true);

  const handleConfirmFolder = () => {
    if (newFolderName.trim()) {
      const color = FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)];
      createFolder(newFolderName.trim(), newFolderIcon, color);
      setNewFolderName('');
      setNewFolderIcon('📁');
      setShowNewFolder(false);
    }
  };

  const handleFolderClick = (id: string) => {
    setActiveFolderId(id);
    setActiveSection('all');
  };

  const handleSectionChange = (s: SidebarSection) => {
    setActiveSection(s);
    setActiveFolderId(null);
  };

  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;

  const getSectionTitle = () => {
    if (activeFolder) return `${activeFolder.icon} ${activeFolder.name}`;
    const titles: Record<SidebarSection, string> = {
      all: 'Все заметки', pinned: 'Закреплённые', favorites: 'Избранное',
      archive: 'Архив', trash: 'Корзина', folders: 'Папки',
    };
    return titles[activeSection];
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden font-golos">
      {/* Top Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-surface shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber/20 flex items-center justify-center">
            <span className="text-amber text-sm">✏️</span>
          </div>
          <span className="font-semibold text-foreground text-base">Заметки</span>
        </div>

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по заметкам и тегам..."
              className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name="X" size={14} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleCreateNote}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber text-background rounded-xl text-sm font-semibold hover:bg-amber/90 transition-all active:scale-95 shrink-0"
        >
          <Icon name="Plus" size={16} />
          <span className="hidden sm:inline">Создать</span>
        </button>

        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-xl hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <Icon name="Menu" size={20} />
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Notes list panel */}
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${selectedNote ? 'w-72 shrink-0 border-r border-border/40' : 'flex-1'}`}>
          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">{getSectionTitle()}</h2>
              <span className="text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
                {filteredNotes.length}
              </span>
            </div>
            {activeFolder && (
              <button
                onClick={() => { setActiveFolderId(null); setActiveSection('all'); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Icon name="X" size={12} />
                <span>Сбросить</span>
              </button>
            )}
          </div>

          {/* Folder quick-access (when on main) */}
          {!activeFolderId && activeSection === 'all' && !search && (
            <div className="px-4 py-3 border-b border-border/20 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface-3 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-all whitespace-nowrap shrink-0 border border-border/30 hover:border-border/60"
                    style={{ borderColor: folder.color + '40' }}
                  >
                    <span>{folder.icon}</span>
                    <span>{folder.name}</span>
                    <span className="text-[10px] opacity-60">
                      {notes.filter(n => n.folderId === folder.id && !n.isDeleted).length}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleCreateFolder}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-lg text-xs text-muted-foreground hover:text-amber transition-all whitespace-nowrap shrink-0 border border-dashed border-border/40 hover:border-amber/40"
                >
                  <Icon name="Plus" size={12} />
                  <span>Папка</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="text-5xl mb-4 opacity-30">
                  {activeSection === 'trash' ? '🗑️' : activeSection === 'archive' ? '📦' : '📝'}
                </div>
                <p className="text-muted-foreground text-sm">
                  {search ? 'Ничего не найдено' : activeSection === 'trash' ? 'Корзина пуста' : 'Заметок пока нет'}
                </p>
                {!search && activeSection !== 'trash' && (
                  <button onClick={handleCreateNote} className="mt-3 text-sm text-amber hover:text-amber/80 transition-colors">
                    Создать первую заметку →
                  </button>
                )}
              </div>
            ) : (
              <div className={selectedNote ? 'space-y-2' : 'note-grid'}>
                {filteredNotes.map(note => (
                  activeSection === 'trash' ? (
                    <div key={note.id} className="bg-surface rounded-xl p-3.5 border border-border/40 animate-fade-in">
                      <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                        {note.title || <span className="italic text-muted-foreground">Без названия</span>}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{note.content}</p>
                      <div className="flex gap-2">
                        <button onClick={() => restoreNote(note.id)} className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
                          <Icon name="RotateCcw" size={12} />Восстановить
                        </button>
                        <button onClick={() => permanentDelete(note.id)} className="text-xs text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1">
                          <Icon name="Trash2" size={12} />Удалить навсегда
                        </button>
                      </div>
                    </div>
                  ) : (
                    <NoteCard
                      key={note.id}
                      note={note}
                      tags={tags}
                      onClick={() => setSelectedNote(note)}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note editor panel */}
        {selectedNote && (
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <NoteEditor
              note={notes.find(n => n.id === selectedNote.id) || selectedNote}
              tags={tags}
              folders={folders}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onClose={() => setSelectedNote(null)}
              onCreateTag={createTag}
            />
          </div>
        )}
      </div>

      {/* Side Drawer */}
      <SideDrawer
        open={drawerOpen}
        activeSection={activeSection}
        folders={folders}
        counts={counts}
        onSection={handleSectionChange}
        onClose={() => setDrawerOpen(false)}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={deleteFolder}
        onFolderClick={handleFolderClick}
        activeFolderId={activeFolderId}
      />

      {/* New folder modal */}
      {showNewFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 drawer-overlay">
          <div className="bg-surface border border-border/60 rounded-2xl p-5 w-80 animate-scale-in shadow-2xl">
            <h3 className="font-semibold text-foreground mb-4">Новая папка</h3>

            <div className="flex flex-wrap gap-2 mb-4">
              {FOLDER_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewFolderIcon(icon)}
                  className={`text-xl p-1.5 rounded-lg transition-all ${newFolderIcon === icon ? 'bg-amber/20 ring-1 ring-amber/50' : 'hover:bg-surface-2'}`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleConfirmFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
              placeholder="Название папки"
              className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber/50 mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewFolder(false)}
                className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 py-2 rounded-lg bg-amber text-background text-sm font-semibold disabled:opacity-40 hover:bg-amber/90 transition-all"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

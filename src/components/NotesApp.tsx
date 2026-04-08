import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Note, Folder } from '@/types/notes';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Экран редактора заметки ───────────────────────────────────────────────
interface EditorProps {
  note: Note;
  folders: Folder[];
  onUpdate: (id: string, u: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

function NoteEditor({ note, folders, onUpdate, onDelete, onBack }: EditorProps) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <button onClick={onBack}>← Назад</button>
        <button
          onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}
          style={{ fontWeight: note.isPinned ? 'bold' : 'normal' }}
        >
          {note.isPinned ? '📌 Закреплено' : '📌 Закрепить'}
        </button>
        <button onClick={() => { onDelete(note.id); onBack(); }} style={{ color: 'red' }}>
          🗑 Удалить
        </button>
      </div>

      <div style={{ marginBottom: 6, fontSize: 12, color: '#666' }}>
        Создано: {fmtDate(note.createdAt)}
        {note.updatedAt !== note.createdAt && <> · Изменено: {fmtDate(note.updatedAt)}</>}
      </div>

      {note.folderId && (
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
          Папка: {folders.find(f => f.id === note.folderId)?.name ?? '—'}
        </div>
      )}

      <input
        value={note.title}
        onChange={e => onUpdate(note.id, { title: e.target.value })}
        placeholder="Заголовок"
        style={{ width: '100%', fontSize: 18, fontWeight: 600, border: 'none', borderBottom: '1px solid #ccc', marginBottom: 12, padding: '4px 0', outline: 'none', boxSizing: 'border-box' }}
      />
      <textarea
        value={note.content}
        onChange={e => onUpdate(note.id, { content: e.target.value })}
        placeholder="Начните писать..."
        rows={16}
        style={{ width: '100%', fontSize: 15, border: '1px solid #ddd', borderRadius: 4, padding: 8, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

// ─── Карточка заметки ──────────────────────────────────────────────────────
interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid #ddd', borderRadius: 6, padding: '10px 12px',
        cursor: 'pointer', background: '#fafafa', marginBottom: 8,
        borderLeft: note.isPinned ? '3px solid #333' : '1px solid #ddd',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
        {note.isPinned && <span style={{ marginRight: 4 }}>📌</span>}
        {note.title || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Без названия</span>}
      </div>
      {note.content && (
        <div style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {note.content.slice(0, 80)}
        </div>
      )}
      <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{fmtDate(note.createdAt)}</div>
    </div>
  );
}

// ─── Боковое меню ──────────────────────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  allCount: number;
  trashCount: number;
  onShowAll: () => void;
  onShowTrash: () => void;
  onOpenFolder: (f: Folder) => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
}

function SideDrawer({
  open, onClose, folders, allCount, trashCount,
  onShowAll, onShowTrash, onOpenFolder, onCreateFolder, onDeleteFolder, onRenameFolder,
}: DrawerProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100 }}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 280,
        background: '#fff', zIndex: 101, padding: 16, overflowY: 'auto',
        borderLeft: '1px solid #ddd',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <strong>Меню</strong>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', marginBottom: 6 }}>Разделы</div>
          <button
            onClick={() => { onShowAll(); onClose(); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}
          >
            📋 Все заметки ({allCount})
          </button>
          <button
            onClick={() => { onShowTrash(); onClose(); }}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14 }}
          >
            🗑 Корзина ({trashCount})
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase' }}>Папки</div>
            <button onClick={onCreateFolder} style={{ fontSize: 12, border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
              + Новая
            </button>
          </div>

          {folders.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              {renamingId === f.id ? (
                <>
                  <input
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { onRenameFolder(f.id, renameVal); setRenamingId(null); }
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    autoFocus
                    style={{ flex: 1, fontSize: 13, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 3 }}
                  />
                  <button onClick={() => { onRenameFolder(f.id, renameVal); setRenamingId(null); }} style={{ fontSize: 11 }}>✓</button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { onOpenFolder(f); onClose(); }}
                    style={{ flex: 1, textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, padding: '6px 0' }}
                  >
                    📁 {f.name}
                  </button>
                  <button
                    onClick={() => { setRenamingId(f.id); setRenameVal(f.name); }}
                    style={{ fontSize: 11, color: '#888', border: 'none', background: 'none', cursor: 'pointer' }}
                    title="Переименовать"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDeleteFolder(f.id)}
                    style={{ fontSize: 11, color: '#c00', border: 'none', background: 'none', cursor: 'pointer' }}
                    title="Удалить папку"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}

          {folders.length === 0 && (
            <div style={{ color: '#aaa', fontSize: 13 }}>Нет папок</div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Главный экран ──────────────────────────────────────────────────────────
export default function NotesApp() {
  const {
    notes, folders,
    createNote, updateNote, deleteNote, restoreNote, permanentDelete,
    createFolder, deleteFolder, renameFolder,
  } = useNotes();

  const [screen, setScreen] = useState<'home' | 'folder' | 'all' | 'trash'>('home');
  const [activeFolder, setActiveFolder] = useState<Folder | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const activeNote = activeNoteId ? notes.find(n => n.id === activeNoteId) ?? null : null;

  const liveNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);

  const folderNotes = (folderId: string) =>
    liveNotes.filter(n => n.folderId === folderId);

  const searchedNotes = search.trim()
    ? liveNotes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const openNote = (note: Note) => setActiveNoteId(note.id);

  const handleCreateNote = (folderId: string | null = null) => {
    const note = createNote(folderId);
    setActiveNoteId(note.id);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setNewFolderModal(false);
    }
  };

  const handleBack = () => setActiveNoteId(null);

  // Если открыта заметка — показываем редактор
  if (activeNote) {
    return (
      <NoteEditor
        note={activeNote}
        folders={folders}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onBack={handleBack}
      />
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, flex: 1 }}>
          {screen === 'folder' && activeFolder ? `📁 ${activeFolder.name}` : screen === 'trash' ? '🗑 Корзина' : screen === 'all' ? '📋 Все заметки' : '🏠 Заметки'}
        </h1>
        {(screen === 'folder' || screen === 'all' || screen === 'trash') && (
          <button onClick={() => { setScreen('home'); setActiveFolder(null); }}>← Назад</button>
        )}
        <button onClick={() => setDrawerOpen(true)}>☰</button>
      </div>

      {/* Поиск */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Поиск по заметкам..."
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
      />

      {/* Результаты поиска */}
      {search.trim() && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
            Результаты поиска ({searchedNotes.length}):
          </div>
          {searchedNotes.length === 0 ? (
            <div style={{ color: '#aaa', fontSize: 13 }}>Ничего не найдено</div>
          ) : (
            searchedNotes.map(n => <NoteCard key={n.id} note={n} onClick={() => openNote(n)} />)
          )}
        </div>
      )}

      {!search.trim() && (
        <>
          {/* Главный экран — папки */}
          {screen === 'home' && (
            <>
              <button
                onClick={() => handleCreateNote(null)}
                style={{ display: 'block', width: '100%', padding: '10px', marginBottom: 16, fontSize: 14, cursor: 'pointer', border: '1px dashed #999', borderRadius: 6, background: 'none' }}
              >
                + Создать заметку
              </button>

              <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>Папки</div>
              {folders.length === 0 && (
                <div style={{ color: '#aaa', fontSize: 13, marginBottom: 12 }}>Нет папок. Создайте через меню ☰</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                {folders.map(f => {
                  const cnt = folderNotes(f.id).length;
                  return (
                    <div
                      key={f.id}
                      onClick={() => { setActiveFolder(f); setScreen('folder'); }}
                      style={{ border: '1px solid #ddd', borderRadius: 8, padding: '14px 12px', cursor: 'pointer', background: '#fafafa', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                      <div style={{ color: '#aaa', fontSize: 12, marginTop: 2 }}>{cnt} заметок</div>
                    </div>
                  );
                })}
              </div>

              {/* Незаписанные заметки (без папки) */}
              {(() => {
                const nf = liveNotes.filter(n => !n.folderId);
                if (nf.length === 0) return null;
                return (
                  <>
                    <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>Без папки</div>
                    {nf.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(n =>
                      <NoteCard key={n.id} note={n} onClick={() => openNote(n)} />
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Экран папки */}
          {screen === 'folder' && activeFolder && (
            <>
              <button
                onClick={() => handleCreateNote(activeFolder.id)}
                style={{ display: 'block', width: '100%', padding: '10px', marginBottom: 16, fontSize: 14, cursor: 'pointer', border: '1px dashed #999', borderRadius: 6, background: 'none' }}
              >
                + Создать заметку в «{activeFolder.name}»
              </button>
              {folderNotes(activeFolder.id).length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13 }}>Нет заметок в этой папке</div>
              ) : (
                folderNotes(activeFolder.id)
                  .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                  .map(n => <NoteCard key={n.id} note={n} onClick={() => openNote(n)} />)
              )}
            </>
          )}

          {/* Экран все заметки */}
          {screen === 'all' && (
            <>
              <button
                onClick={() => handleCreateNote(null)}
                style={{ display: 'block', width: '100%', padding: '10px', marginBottom: 16, fontSize: 14, cursor: 'pointer', border: '1px dashed #999', borderRadius: 6, background: 'none' }}
              >
                + Создать заметку
              </button>
              {liveNotes.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13 }}>Заметок нет</div>
              ) : (
                liveNotes
                  .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                  .map(n => <NoteCard key={n.id} note={n} onClick={() => openNote(n)} />)
              )}
            </>
          )}

          {/* Корзина */}
          {screen === 'trash' && (
            <>
              {trashNotes.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13 }}>Корзина пуста</div>
              ) : (
                trashNotes.map(n => (
                  <div key={n.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: '10px 12px', marginBottom: 8, background: '#fafafa' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      {n.title || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Без названия</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>Удалено: {n.deletedAt ? fmtDate(n.deletedAt) : '—'}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => restoreNote(n.id)} style={{ fontSize: 12 }}>↩ Восстановить</button>
                      <button onClick={() => permanentDelete(n.id)} style={{ fontSize: 12, color: 'red' }}>✕ Удалить навсегда</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}

      {/* Боковое меню */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        folders={folders}
        allCount={liveNotes.length}
        trashCount={trashNotes.length}
        onShowAll={() => { setScreen('all'); setActiveFolder(null); }}
        onShowTrash={() => { setScreen('trash'); setActiveFolder(null); }}
        onOpenFolder={f => { setActiveFolder(f); setScreen('folder'); }}
        onCreateFolder={() => { setDrawerOpen(false); setNewFolderModal(true); }}
        onDeleteFolder={id => { deleteFolder(id); if (activeFolder?.id === id) { setScreen('home'); setActiveFolder(null); } }}
        onRenameFolder={renameFolder}
      />

      {/* Модалка создания папки */}
      {newFolderModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 24, width: 300 }}>
            <h3 style={{ margin: '0 0 12px' }}>Новая папка</h3>
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setNewFolderModal(false); }}
              placeholder="Название папки"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setNewFolderModal(false)} style={{ flex: 1, padding: '8px', cursor: 'pointer' }}>Отмена</button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                style={{ flex: 1, padding: '8px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: 6 }}
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

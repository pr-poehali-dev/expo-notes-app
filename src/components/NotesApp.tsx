import { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Note, Folder } from '@/types/notes';

/* ── helpers ──────────────────────────────────────────── */
function fmt(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── NoteCard ─────────────────────────────────────────── */
function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  return (
    <div onClick={onClick} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors bg-white">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-medium text-sm text-gray-900 leading-tight">
          {note.isPinned && <span className="mr-1">📌</span>}
          {note.title || <span className="italic text-gray-400">Без названия</span>}
        </span>
      </div>
      {note.content && (
        <p className="text-xs text-gray-500 truncate mb-1">{note.content}</p>
      )}
      <p className="text-xs text-gray-400">{fmt(note.createdAt)}</p>
    </div>
  );
}

/* ── NoteEditor ───────────────────────────────────────── */
interface EditorProps {
  note: Note;
  folders: Folder[];
  onUpdate: (id: string, u: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

function NoteEditor({ note, folders, onUpdate, onDelete, onBack }: EditorProps) {
  const folder = folders.find(f => f.id === note.folderId);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50 shrink-0">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Назад</button>
        <span className="flex-1 text-xs text-gray-400">
          {folder ? `📁 ${folder.name}` : 'Без папки'}
        </span>
        <button
          onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}
          className={`text-sm px-2 py-1 rounded border transition-colors ${note.isPinned ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}
        >
          {note.isPinned ? '📌 Закреплено' : '📌 Закрепить'}
        </button>
        <button
          onClick={() => { onDelete(note.id); onBack(); }}
          className="text-sm px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
        >
          🗑 Удалить
        </button>
      </div>

      {/* meta */}
      <div className="px-4 py-2 border-b bg-gray-50 shrink-0 text-xs text-gray-400 flex gap-4">
        <span>Создано: {fmt(note.createdAt)}</span>
        {note.updatedAt !== note.createdAt && <span>Изменено: {fmt(note.updatedAt)}</span>}
      </div>

      {/* content */}
      <div className="flex flex-col flex-1 overflow-hidden px-4 pt-3 pb-4">
        <input
          value={note.title}
          onChange={e => onUpdate(note.id, { title: e.target.value })}
          placeholder="Заголовок"
          className="text-xl font-semibold text-gray-900 outline-none border-b border-transparent focus:border-gray-200 pb-2 mb-3 w-full"
        />
        <textarea
          value={note.content}
          onChange={e => onUpdate(note.id, { content: e.target.value })}
          placeholder="Начните писать..."
          className="flex-1 resize-none outline-none text-sm text-gray-700 leading-relaxed w-full"
        />
      </div>
    </div>
  );
}

/* ── SideDrawer ───────────────────────────────────────── */
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
  onShowAll, onShowTrash, onOpenFolder,
  onCreateFolder, onDeleteFolder, onRenameFolder,
}: DrawerProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/30 z-40" />
      <div className="fixed right-0 top-0 bottom-0 w-72 bg-white z-50 border-l shadow-lg flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-gray-800">Меню</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* sections */}
          <div className="px-3 mb-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mb-1">Разделы</p>
            <button
              onClick={() => { onShowAll(); onClose(); }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span>📋 Все заметки</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{allCount}</span>
            </button>
            <button
              onClick={() => { onShowTrash(); onClose(); }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <span>🗑 Корзина</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{trashCount}</span>
            </button>
          </div>

          {/* folders */}
          <div className="px-3">
            <div className="flex items-center justify-between px-2 mb-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Папки</p>
              <button
                onClick={onCreateFolder}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                + Создать
              </button>
            </div>

            {folders.length === 0 && (
              <p className="text-sm text-gray-400 px-2 py-2">Папок пока нет</p>
            )}

            {folders.map(f => (
              <div key={f.id} className="flex items-center gap-1 group">
                {renamingId === f.id ? (
                  <>
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { onRenameFolder(f.id, renameVal); setRenamingId(null); }
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      className="flex-1 text-sm border rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={() => { onRenameFolder(f.id, renameVal); setRenamingId(null); }}
                      className="text-green-600 text-sm px-1"
                    >✓</button>
                    <button onClick={() => setRenamingId(null)} className="text-gray-400 text-sm px-1">✕</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { onOpenFolder(f); onClose(); }}
                      className="flex-1 text-left px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      📁 {f.name}
                    </button>
                    <button
                      onClick={() => { setRenamingId(f.id); setRenameVal(f.name); }}
                      className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-gray-600 px-1"
                      title="Переименовать"
                    >✎</button>
                    <button
                      onClick={() => onDeleteFolder(f.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 px-1"
                      title="Удалить"
                    >✕</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── CreateFolderModal ────────────────────────────────── */
function CreateFolderModal({ onConfirm, onCancel }: { onConfirm: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Новая папка</h3>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim()); if (e.key === 'Escape') onCancel(); }}
          placeholder="Название папки"
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Отмена</button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────── */
type Screen = 'home' | 'folder' | 'all' | 'trash';

export default function NotesApp() {
  const {
    notes, folders,
    createNote, updateNote, deleteNote, restoreNote, permanentDelete,
    createFolder, deleteFolder, renameFolder,
  } = useNotes();

  const [screen, setScreen] = useState<Screen>('home');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);

  const liveNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);

  const activeNote = activeNoteId ? notes.find(n => n.id === activeNoteId) ?? null : null;
  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) ?? null : null;

  const folderNotes = (fid: string) =>
    liveNotes
      .filter(n => n.folderId === fid)
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const searchResults = search.trim()
    ? liveNotes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const handleNewNote = (folderId: string | null = null) => {
    const note = createNote(folderId);
    setActiveNoteId(note.id);
  };

  const handleOpenFolder = (f: Folder) => {
    setActiveFolderId(f.id);
    setScreen('folder');
  };

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id);
    if (activeFolderId === id) { setScreen('home'); setActiveFolderId(null); }
  };

  const handleCreateFolder = (name: string) => {
    createFolder(name);
    setShowNewFolder(false);
  };

  const goHome = () => { setScreen('home'); setActiveFolderId(null); };

  /* Если открыта заметка — показываем редактор */
  if (activeNote) {
    return (
      <NoteEditor
        note={activeNote}
        folders={folders}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onBack={() => setActiveNoteId(null)}
      />
    );
  }

  /* Заголовок текущего экрана */
  const screenTitle =
    screen === 'folder' && activeFolder ? `📁 ${activeFolder.name}` :
    screen === 'all' ? '📋 Все заметки' :
    screen === 'trash' ? '🗑 Корзина' : '🏠 Заметки';

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 bg-white border-b sticky top-0 z-10">
          {screen !== 'home' && (
            <button onClick={goHome} className="text-blue-600 text-sm hover:underline shrink-0">← Назад</button>
          )}
          <h1 className="font-semibold text-gray-900 flex-1 truncate">{screenTitle}</h1>
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-lg leading-none"
          >
            ☰
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по заметкам..."
            className="w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
          />

          {/* Search results */}
          {searchResults && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Найдено: {searchResults.length}</p>
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-400">Ничего не найдено</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map(n => <NoteCard key={n.id} note={n} onClick={() => setActiveNoteId(n.id)} />)}
                </div>
              )}
            </div>
          )}

          {!searchResults && (
            <>
              {/* HOME */}
              {screen === 'home' && (
                <>
                  <button
                    onClick={() => handleNewNote(null)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white"
                  >
                    + Создать заметку
                  </button>

                  {/* Folders grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Папки</p>
                      <button
                        onClick={() => setShowNewFolder(true)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Папка
                      </button>
                    </div>
                    {folders.length === 0 ? (
                      <p className="text-sm text-gray-400">Нет папок. Создайте через кнопку выше или меню ☰</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {folders.map(f => {
                          const cnt = folderNotes(f.id).length;
                          return (
                            <div
                              key={f.id}
                              onClick={() => handleOpenFolder(f)}
                              className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow-sm hover:border-blue-200 transition-all text-center"
                            >
                              <div className="text-3xl mb-2">📁</div>
                              <p className="font-medium text-sm text-gray-800 truncate">{f.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{cnt} заметок</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Notes without folder */}
                  {(() => {
                    const nf = liveNotes
                      .filter(n => !n.folderId)
                      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
                    if (!nf.length) return null;
                    return (
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Без папки</p>
                        <div className="space-y-2">
                          {nf.map(n => <NoteCard key={n.id} note={n} onClick={() => setActiveNoteId(n.id)} />)}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* FOLDER */}
              {screen === 'folder' && activeFolder && (
                <>
                  <button
                    onClick={() => handleNewNote(activeFolder.id)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white"
                  >
                    + Создать заметку в «{activeFolder.name}»
                  </button>
                  {folderNotes(activeFolder.id).length === 0 ? (
                    <p className="text-sm text-gray-400">В этой папке нет заметок</p>
                  ) : (
                    <div className="space-y-2">
                      {folderNotes(activeFolder.id).map(n =>
                        <NoteCard key={n.id} note={n} onClick={() => setActiveNoteId(n.id)} />
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ALL */}
              {screen === 'all' && (
                <>
                  <button
                    onClick={() => handleNewNote(null)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors bg-white"
                  >
                    + Создать заметку
                  </button>
                  {liveNotes.length === 0 ? (
                    <p className="text-sm text-gray-400">Нет заметок</p>
                  ) : (
                    <div className="space-y-2">
                      {liveNotes
                        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                        .map(n => <NoteCard key={n.id} note={n} onClick={() => setActiveNoteId(n.id)} />)}
                    </div>
                  )}
                </>
              )}

              {/* TRASH */}
              {screen === 'trash' && (
                <>
                  {trashNotes.length === 0 ? (
                    <p className="text-sm text-gray-400">Корзина пуста</p>
                  ) : (
                    <div className="space-y-2">
                      {trashNotes.map(n => (
                        <div key={n.id} className="bg-white border rounded-lg p-3">
                          <p className="font-medium text-sm text-gray-700 mb-0.5">
                            {n.title || <span className="italic text-gray-400">Без названия</span>}
                          </p>
                          {n.content && <p className="text-xs text-gray-400 truncate mb-1">{n.content}</p>}
                          <p className="text-xs text-gray-400 mb-2">
                            Удалено: {n.deletedAt ? fmt(n.deletedAt) : '—'}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => restoreNote(n.id)}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              ↩ Восстановить
                            </button>
                            <button
                              onClick={() => permanentDelete(n.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              ✕ Удалить навсегда
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* SideDrawer */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        folders={folders}
        allCount={liveNotes.length}
        trashCount={trashNotes.length}
        onShowAll={() => { setScreen('all'); setActiveFolderId(null); }}
        onShowTrash={() => { setScreen('trash'); setActiveFolderId(null); }}
        onOpenFolder={handleOpenFolder}
        onCreateFolder={() => { setDrawerOpen(false); setShowNewFolder(true); }}
        onDeleteFolder={handleDeleteFolder}
        onRenameFolder={renameFolder}
      />

      {/* Create folder modal */}
      {showNewFolder && (
        <CreateFolderModal
          onConfirm={handleCreateFolder}
          onCancel={() => setShowNewFolder(false)}
        />
      )}
    </div>
  );
}

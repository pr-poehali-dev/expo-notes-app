import { useState, useEffect, useRef } from 'react';
import { Note, Tag, Folder } from '@/types/notes';
import Icon from '@/components/ui/icon';

interface Props {
  note: Note;
  tags: Tag[];
  folders: Folder[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onCreateTag: (name: string) => Tag;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function NoteEditor({ note, tags, folders, onUpdate, onDelete, onClose, onCreateTag }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  useEffect(() => {
    if (!note.title && titleRef.current) titleRef.current.focus();
  }, [note.id]);

  const save = (t = title, c = content) => {
    onUpdate(note.id, { title: t, content: c });
  };

  const toggleTag = (tagId: string) => {
    const newTags = note.tags.includes(tagId)
      ? note.tags.filter(t => t !== tagId)
      : [...note.tags, tagId];
    onUpdate(note.id, { tags: newTags });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const existing = tags.find(t => t.name.toLowerCase() === tagInput.toLowerCase());
    if (existing) {
      if (!note.tags.includes(existing.id)) onUpdate(note.id, { tags: [...note.tags, existing.id] });
    } else {
      const newTag = onCreateTag(tagInput.trim());
      onUpdate(note.id, { tags: [...note.tags, newTag.id] });
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const folder = folders.find(f => f.id === note.folderId);

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          {folder && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground flex items-center gap-1">
              <span>{folder.icon}</span>
              <span>{folder.name}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate(note.id, { isPinned: !note.isPinned })}
            className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-amber bg-amber/10' : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'}`}
            title={note.isPinned ? 'Открепить' : 'Закрепить'}
          >
            <Icon name="Pin" size={16} />
          </button>
          <button
            onClick={() => onUpdate(note.id, { isFavorite: !note.isFavorite })}
            className={`p-1.5 rounded-lg transition-colors ${note.isFavorite ? 'text-amber bg-amber/10' : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'}`}
            title={note.isFavorite ? 'Убрать из избранного' : 'В избранное'}
          >
            <Icon name={note.isFavorite ? 'Star' : 'Star'} size={16} />
          </button>
          <button
            onClick={() => onUpdate(note.id, { isArchived: !note.isArchived })}
            className={`p-1.5 rounded-lg transition-colors ${note.isArchived ? 'text-blue-400 bg-blue-400/10' : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'}`}
            title={note.isArchived ? 'Разархивировать' : 'В архив'}
          >
            <Icon name="Archive" size={16} />
          </button>
          <button
            onClick={() => { onDelete(note.id); onClose(); }}
            className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Удалить"
          >
            <Icon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => save()}
          placeholder="Заголовок"
          className="bg-transparent text-xl font-semibold text-foreground placeholder:text-muted-foreground/50 outline-none w-full"
        />

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-6">
          {note.tags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <button
                key={tagId}
                onClick={() => toggleTag(tagId)}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                style={{ background: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}
              >
                <span>#</span>{tag.name}
                <Icon name="X" size={10} />
              </button>
            );
          })}
          {showTagInput ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') setShowTagInput(false); }}
                onBlur={handleAddTag}
                placeholder="тег..."
                className="text-xs bg-surface-2 border border-border rounded-full px-2 py-0.5 outline-none w-20 text-foreground"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber transition-colors"
            >
              <Icon name="Tag" size={12} />
              <span>тег</span>
            </button>
          )}
        </div>

        {/* Available tags */}
        {tags.filter(t => !note.tags.includes(t.id)).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.filter(t => !note.tags.includes(t.id)).map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="text-xs px-2 py-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-border"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onBlur={() => save()}
          placeholder="Начните писать..."
          className="flex-1 bg-transparent text-foreground/90 placeholder:text-muted-foreground/40 outline-none resize-none leading-relaxed text-sm min-h-[300px]"
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Создано: {formatDate(note.createdAt)}</span>
        {note.updatedAt !== note.createdAt && (
          <span>Изменено: {formatDate(note.updatedAt)}</span>
        )}
      </div>
    </div>
  );
}

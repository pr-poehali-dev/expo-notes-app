import { Note, Tag } from '@/types/notes';
import Icon from '@/components/ui/icon';

interface Props {
  note: Note;
  tags: Tag[];
  onClick: () => void;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 86400000) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 86400000 * 7) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export default function NoteCard({ note, tags, onClick }: Props) {
  const noteTags = tags.filter(t => note.tags.includes(t.id));
  const preview = note.content.replace(/\n+/g, ' ').slice(0, 90);

  return (
    <div
      onClick={onClick}
      className="group relative bg-surface rounded-xl p-3.5 border border-border/40 hover:border-border/80 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 animate-fade-in"
    >
      {/* Pinned indicator */}
      {note.isPinned && (
        <div className="absolute top-2.5 right-2.5 text-amber opacity-70">
          <Icon name="Pin" size={12} />
        </div>
      )}
      {note.isFavorite && (
        <div className="absolute top-2.5 right-2.5 text-amber opacity-80">
          <Icon name="Star" size={12} />
        </div>
      )}

      <h3 className="font-medium text-sm text-foreground mb-1 pr-5 line-clamp-2 leading-snug">
        {note.title || <span className="text-muted-foreground italic">Без названия</span>}
      </h3>

      {preview && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{preview}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex flex-wrap gap-1">
          {noteTags.slice(0, 2).map(tag => (
            <span
              key={tag.id}
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: tag.color + '22', color: tag.color }}
            >
              #{tag.name}
            </span>
          ))}
          {noteTags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">+{noteTags.length - 2}</span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{formatDate(note.updatedAt)}</span>
      </div>

      {/* Quick actions */}
      <div className="absolute inset-0 rounded-xl bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
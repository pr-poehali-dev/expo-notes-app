import { SidebarSection, Folder } from '@/types/notes';
import Icon from '@/components/ui/icon';

interface Props {
  open: boolean;
  activeSection: SidebarSection;
  folders: Folder[];
  counts: {
    all: number; pinned: number; favorites: number;
    archive: number; trash: number; folders: number;
  };
  onSection: (s: SidebarSection) => void;
  onClose: () => void;
  onCreateFolder: () => void;
  onDeleteFolder: (id: string) => void;
  onFolderClick: (id: string) => void;
  activeFolderId: string | null;
}

type CountKey = 'all' | 'pinned' | 'favorites' | 'archive' | 'trash' | 'folders';

const NAV_ITEMS: { id: SidebarSection; icon: string; label: string; countKey: CountKey }[] = [
  { id: 'all', icon: 'FileText', label: 'Все заметки', countKey: 'all' },
  { id: 'pinned', icon: 'Pin', label: 'Закреплённые', countKey: 'pinned' },
  { id: 'favorites', icon: 'Star', label: 'Избранное', countKey: 'favorites' },
  { id: 'archive', icon: 'Archive', label: 'Архив', countKey: 'archive' },
  { id: 'trash', icon: 'Trash2', label: 'Корзина', countKey: 'trash' },
];

export default function SideDrawer({
  open, activeSection, folders, counts, onSection, onClose,
  onCreateFolder, onDeleteFolder, onFolderClick, activeFolderId,
}: Props) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 drawer-overlay"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-72 bg-[hsl(var(--sidebar-background))] border-l border-border/50 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <span className="font-semibold text-foreground">Навигация</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors text-muted-foreground hover:text-foreground">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Main navigation */}
          <div className="px-3 mb-1">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-2">Разделы</span>
          </div>
          <nav className="px-3 space-y-0.5 mb-4">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { onSection(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  activeSection === item.id && !activeFolderId
                    ? 'bg-amber/15 text-amber font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                }`}
              >
                <Icon name={item.icon} size={16} />
                <span className="flex-1 text-left">{item.label}</span>
                <span className={`text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                  activeSection === item.id && !activeFolderId ? 'bg-amber/20 text-amber' : 'bg-surface-3 text-muted-foreground'
                }`}>
                  {counts[item.countKey]}
                </span>
              </button>
            ))}
          </nav>

          {/* Folders */}
          <div className="px-3 mb-1 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-2">Папки</span>
            <button
              onClick={onCreateFolder}
              className="p-1 rounded hover:bg-surface-2 text-muted-foreground hover:text-amber transition-colors"
              title="Создать папку"
            >
              <Icon name="FolderPlus" size={14} />
            </button>
          </div>
          <div className="px-3 space-y-0.5">
            {folders.map(folder => (
              <div
                key={folder.id}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm ${
                  activeFolderId === folder.id
                    ? 'bg-amber/15 text-amber font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
                }`}
                onClick={() => { onFolderClick(folder.id); onClose(); }}
              >
                <span className="text-base">{folder.icon}</span>
                <span className="flex-1 truncate">{folder.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-destructive transition-all"
                >
                  <Icon name="Trash2" size={12} />
                </button>
              </div>
            ))}
            {folders.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-2">Нет папок</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">Заметки · v1.0</p>
        </div>
      </div>
    </>
  );
}
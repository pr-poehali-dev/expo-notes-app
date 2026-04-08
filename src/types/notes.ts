export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

export type SidebarSection = 'all' | 'pinned' | 'favorites' | 'archive' | 'trash' | 'folders';

export interface AppState {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
}

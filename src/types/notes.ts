export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export type Screen = 'home' | 'folder' | 'note' | 'trash';

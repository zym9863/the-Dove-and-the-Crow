export interface Letter {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  status: LetterStatus;
  recipient?: string; // 可选的收信人
  tags?: string[]; // 可选的标签
}

export enum LetterStatus {
  ACTIVE = 'active',     // 活跃状态，可编辑
  SEALED = 'sealed',     // 封存状态，不可编辑但可查看（放飞白鸽）
  DELETED = 'deleted'    // 已删除状态，彻底删除（沉入深海）
}

export interface LetterDraft {
  id: string;
  title: string;
  content: string;
  lastSaved: Date;
}

export interface FarewellCeremony {
  type: 'dove' | 'sea';
  letterId: string;
  performedAt: Date;
  message?: string; // 告别时的留言
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  autoSaveInterval: number; // 秒
  showConfirmation: boolean; // 是否显示删除确认
}

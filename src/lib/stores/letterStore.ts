import { writable, derived } from 'svelte/store';
import localforage from 'localforage';
import type { Letter, LetterDraft, LetterStatus, FarewellCeremony } from '../types.js';

// 配置 localforage
localforage.config({
  name: 'DoveAndCrow',
  storeName: 'letters',
  description: '白鸽与乌鸦 - 无声信笺存储'
});

// 创建独立的存储实例
const lettersDB = localforage.createInstance({
  name: 'DoveAndCrow',
  storeName: 'letters'
});

const draftsDB = localforage.createInstance({
  name: 'DoveAndCrow',
  storeName: 'drafts'
});

const ceremoniesDB = localforage.createInstance({
  name: 'DoveAndCrow',
  storeName: 'ceremonies'
});

// 存储状态
export const letters = writable<Letter[]>([]);
export const currentDraft = writable<LetterDraft | null>(null);
export const isLoading = writable(false);

// 派生状态
export const activeLetters = derived(letters, $letters => 
  $letters.filter(letter => letter.status === 'active')
);

export const sealedLetters = derived(letters, $letters => 
  $letters.filter(letter => letter.status === 'sealed')
);

// 生成唯一ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 信笺管理函数
export const letterStore = {
  // 加载所有信笺
  async loadLetters(): Promise<void> {
    isLoading.set(true);
    try {
      const storedLetters: Letter[] = [];
      await lettersDB.iterate<Letter, void>((letter) => {
        // 确保日期对象正确转换
        letter.createdAt = new Date(letter.createdAt);
        letter.updatedAt = new Date(letter.updatedAt);
        storedLetters.push(letter);
      });
      
      // 按创建时间倒序排列
      storedLetters.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      letters.set(storedLetters);
    } catch (error) {
      console.error('加载信笺失败:', error);
    } finally {
      isLoading.set(false);
    }
  },

  // 保存信笺
  async saveLetter(letter: Omit<Letter, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = new Date();
    const newLetter: Letter = {
      ...letter,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };

    try {
      await lettersDB.setItem(newLetter.id, newLetter);
      
      // 更新本地状态
      letters.update(current => [newLetter, ...current]);
      
      return newLetter.id;
    } catch (error) {
      console.error('保存信笺失败:', error);
      throw error;
    }
  },

  // 更新信笺
  async updateLetter(id: string, updates: Partial<Letter>): Promise<void> {
    try {
      const existingLetter = await lettersDB.getItem<Letter>(id);
      if (!existingLetter) {
        throw new Error('信笺不存在');
      }

      const updatedLetter: Letter = {
        ...existingLetter,
        ...updates,
        updatedAt: new Date()
      };

      await lettersDB.setItem(id, updatedLetter);
      
      // 更新本地状态
      letters.update(current => 
        current.map(letter => letter.id === id ? updatedLetter : letter)
      );
    } catch (error) {
      console.error('更新信笺失败:', error);
      throw error;
    }
  },

  // 删除信笺（物理删除）
  async deleteLetter(id: string): Promise<void> {
    try {
      await lettersDB.removeItem(id);
      
      // 更新本地状态
      letters.update(current => current.filter(letter => letter.id !== id));
    } catch (error) {
      console.error('删除信笺失败:', error);
      throw error;
    }
  },

  // 获取单个信笺
  async getLetter(id: string): Promise<Letter | null> {
    try {
      const letter = await lettersDB.getItem<Letter>(id);
      if (letter) {
        letter.createdAt = new Date(letter.createdAt);
        letter.updatedAt = new Date(letter.updatedAt);
      }
      return letter;
    } catch (error) {
      console.error('获取信笺失败:', error);
      return null;
    }
  }
};

// 草稿管理函数
export const draftStore = {
  // 保存草稿
  async saveDraft(draft: Omit<LetterDraft, 'lastSaved'>): Promise<void> {
    const draftWithTimestamp: LetterDraft = {
      ...draft,
      lastSaved: new Date()
    };

    try {
      await draftsDB.setItem(draft.id, draftWithTimestamp);
      currentDraft.set(draftWithTimestamp);
    } catch (error) {
      console.error('保存草稿失败:', error);
      throw error;
    }
  },

  // 加载草稿
  async loadDraft(id: string): Promise<LetterDraft | null> {
    try {
      const draft = await draftsDB.getItem<LetterDraft>(id);
      if (draft) {
        draft.lastSaved = new Date(draft.lastSaved);
        currentDraft.set(draft);
      }
      return draft;
    } catch (error) {
      console.error('加载草稿失败:', error);
      return null;
    }
  },

  // 删除草稿
  async deleteDraft(id: string): Promise<void> {
    try {
      await draftsDB.removeItem(id);
      currentDraft.set(null);
    } catch (error) {
      console.error('删除草稿失败:', error);
      throw error;
    }
  }
};

// 告别仪式管理
export const ceremonyStore = {
  // 执行告别仪式
  async performCeremony(ceremony: Omit<FarewellCeremony, 'performedAt'>): Promise<void> {
    const ceremonyRecord: FarewellCeremony = {
      ...ceremony,
      performedAt: new Date()
    };

    try {
      // 保存仪式记录
      await ceremoniesDB.setItem(ceremony.letterId, ceremonyRecord);
      
      // 根据仪式类型更新信笺状态
      if (ceremony.type === 'dove') {
        // 放飞白鸽 - 封存信笺
        await letterStore.updateLetter(ceremony.letterId, { status: 'sealed' as LetterStatus });
      } else if (ceremony.type === 'sea') {
        // 沉入深海 - 彻底删除
        await letterStore.deleteLetter(ceremony.letterId);
      }
    } catch (error) {
      console.error('执行告别仪式失败:', error);
      throw error;
    }
  },

  // 获取仪式记录
  async getCeremony(letterId: string): Promise<FarewellCeremony | null> {
    try {
      const ceremony = await ceremoniesDB.getItem<FarewellCeremony>(letterId);
      if (ceremony) {
        ceremony.performedAt = new Date(ceremony.performedAt);
      }
      return ceremony;
    } catch (error) {
      console.error('获取仪式记录失败:', error);
      return null;
    }
  }
};

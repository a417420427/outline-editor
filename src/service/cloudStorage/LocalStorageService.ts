
export class LocalStorageService implements CloudStorage {
  private key: string;

  constructor(key: string = "outline_state") {
    this.key = key;
  }

  async saveState(state: Partial<OutlineState>): Promise<void> {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (error) {
      console.error("保存数据出错：", error);
    }
  }

  async loadState(): Promise<Partial<OutlineState> | null> {
    try {
      const json = localStorage.getItem(this.key);
      if (!json) return null;
      return JSON.parse(json) as Partial<OutlineState>;
    } catch (error) {
      console.error("加载数据出错：", error);
      return null;
    }
  }

  async removeState(): Promise<void> {
    localStorage.removeItem(this.key);
  }
}

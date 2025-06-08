import { LocalStorageService } from "./LocalStorageService";

// 根据环境/配置选一个实现
export const cloudStorage = new LocalStorageService();



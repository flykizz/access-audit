import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScanResult, BehaviorResult, CoverageData, AuditTask } from '@accessaudit/core';

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  role?: string;
}

interface AppState {
  scanResults: ScanResult[];
  behaviorResults: BehaviorResult[];
  coverageData: CoverageData | null;
  currentTask: AuditTask | null;
  tasks: AuditTask[];
  user: User | null;
  accessToken: string | null;
  addScanResult: (result: ScanResult) => void;
  addScanResults: (results: ScanResult[]) => void;
  addBehaviorResult: (result: BehaviorResult) => void;
  setCoverageData: (data: CoverageData) => void;
  setCurrentTask: (task: AuditTask) => void;
  addTask: (task: AuditTask) => void;
  updateTask: (taskId: string, updates: Partial<AuditTask>) => void;
  clearResults: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      scanResults: [],
      behaviorResults: [],
      coverageData: null,
      currentTask: null,
      tasks: [],
      user: null,
      accessToken: null,
      addScanResult: (result) => set((state) => ({ scanResults: [...state.scanResults, result] })),
      addScanResults: (results) => set((state) => ({ scanResults: [...state.scanResults, ...results] })),
      addBehaviorResult: (result) => set((state) => ({ behaviorResults: [...state.behaviorResults, result] })),
      setCoverageData: (data) => set({ coverageData: data }),
      setCurrentTask: (task) => set({ currentTask: task }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (taskId, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === taskId ? { ...t, ...updates } : t)),
      })),
      clearResults: () => set({ scanResults: [], behaviorResults: [], coverageData: null }),
      login: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null, scanResults: [], behaviorResults: [], coverageData: null, tasks: [] }),
    }),
    {
      name: 'accessaudit-app-store',
    }
  )
);

import { create } from 'zustand';
import type { ScanResult, BehaviorResult, CoverageData, AuditTask } from '@accessaudit/core';

interface AppState {
  scanResults: ScanResult[];
  behaviorResults: BehaviorResult[];
  coverageData: CoverageData | null;
  currentTask: AuditTask | null;
  tasks: AuditTask[];
  addScanResult: (result: ScanResult) => void;
  addBehaviorResult: (result: BehaviorResult) => void;
  setCoverageData: (data: CoverageData) => void;
  setCurrentTask: (task: AuditTask) => void;
  addTask: (task: AuditTask) => void;
  updateTask: (taskId: string, updates: Partial<AuditTask>) => void;
  clearResults: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  scanResults: [],
  behaviorResults: [],
  coverageData: null,
  currentTask: null,
  tasks: [],
  addScanResult: (result) => set((state) => ({ scanResults: [...state.scanResults, result] })),
  addBehaviorResult: (result) => set((state) => ({ behaviorResults: [...state.behaviorResults, result] })),
  setCoverageData: (data) => set({ coverageData: data }),
  setCurrentTask: (task) => set({ currentTask: task }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.taskId === taskId ? { ...t, ...updates } : t)),
  })),
  clearResults: () => set({ scanResults: [], behaviorResults: [], coverageData: null }),
}));

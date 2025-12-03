// Zustand store for app state management
import { create } from "zustand"
import type { Producer, Consumer, WebhookLog, AppState } from "./types"

interface Store extends AppState {
  // Producer actions
  addProducer: (producer: Producer) => void
  updateProducer: (id: string, updates: Partial<Producer>) => void
  deleteProducer: (id: string) => void

  // Consumer actions
  addConsumer: (consumer: Consumer) => void
  updateConsumer: (id: string, updates: Partial<Consumer>) => void
  deleteConsumer: (id: string) => void
  getConsumersByProducerId: (producerId: string) => Consumer[]

  // Log actions
  addLog: (log: WebhookLog) => void
  getLogsByConsumerId: (consumerId: string) => WebhookLog[]

  // Utility
  generateId: () => string
}

export const useStore = create<Store>((set, get) => ({
  producers: [],
  consumers: [],
  logs: [],

  generateId: () => Math.random().toString(36).substring(2, 11),

  addProducer: (producer) =>
    set((state) => ({
      producers: [...state.producers, producer],
    })),

  updateProducer: (id, updates) =>
    set((state) => ({
      producers: state.producers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deleteProducer: (id) =>
    set((state) => ({
      producers: state.producers.filter((p) => p.id !== id),
      consumers: state.consumers.filter((c) => c.producerId !== id),
    })),

  addConsumer: (consumer) =>
    set((state) => ({
      consumers: [...state.consumers, consumer],
    })),

  updateConsumer: (id, updates) =>
    set((state) => ({
      consumers: state.consumers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteConsumer: (id) =>
    set((state) => ({
      consumers: state.consumers.filter((c) => c.id !== id),
    })),

  getConsumersByProducerId: (producerId) => {
    return get().consumers.filter((c) => c.producerId === producerId)
  },

  addLog: (log) =>
    set((state) => ({
      logs: [log, ...state.logs].slice(0, 100), // Keep last 100 logs
    })),

  getLogsByConsumerId: (consumerId) => {
    return get().logs.filter((l) => l.consumerId === consumerId)
  },
}))

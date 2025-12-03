// Type definitions for the webhook app

export type AttributeType = "int" | "string" | "object" | "array"

export interface Attribute {
  key: string
  type: AttributeType
  defaultValue?: any
}

export interface Producer {
  id: string
  name: string
  description?: string
  attributes: Attribute[]
  status: "active" | "inactive"
  createdAt: Date
  endpoint: string // e.g., /api/producers/producer-id
}

export type MappingType = "direct" | "hardcoded" | "expression"

export interface ConsumerAttribute {
  key: string
  type: AttributeType
  mappingType: MappingType
  producerAttributeKey?: string // For direct mapping
  value?: any // For hardcoded values
  expression?: string // For template expressions like "${userId} * 2"
}

export interface Consumer {
  id: string
  producerId: string
  name: string
  webhookUrl: string
  attributes: ConsumerAttribute[]
  status: "active" | "inactive"
  createdAt: Date
  lastTriggered?: Date
}

export interface WebhookLog {
  id: string
  consumerId: string
  producerId: string
  status: "success" | "failed" | "pending"
  payload: any
  response?: any
  error?: string
  timestamp: Date
}

export interface AppState {
  producers: Producer[]
  consumers: Consumer[]
  logs: WebhookLog[]
}

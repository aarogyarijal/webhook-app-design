"use client"

import type React from "react"

import { useState } from "react"
import type { Producer, Consumer, ConsumerAttribute, MappingType, AttributeType } from "@/lib/types"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { AttributeBadge } from "./attribute-badge"

interface ConsumerFormProps {
  producerId: string
  producer: Producer
  initialConsumer?: Consumer
  onSubmit: () => void
  onCancel: () => void
}

export function ConsumerForm({ producerId, producer, initialConsumer, onSubmit, onCancel }: ConsumerFormProps) {
  const { addConsumer, updateConsumer, generateId } = useStore()

  const [name, setName] = useState(initialConsumer?.name || "")
  const [webhookUrl, setWebhookUrl] = useState(initialConsumer?.webhookUrl || "")
  const [status, setStatus] = useState<"active" | "inactive">(initialConsumer?.status || "active")
  const [attributes, setAttributes] = useState<ConsumerAttribute[]>(initialConsumer?.attributes || [])

  const [newAttrKey, setNewAttrKey] = useState("")
  const [newAttrType, setNewAttrType] = useState<AttributeType>("string")
  const [mappingType, setMappingType] = useState<MappingType>("direct")
  const [producerAttrKey, setProducerAttrKey] = useState("")
  const [hardcodedValue, setHardcodedValue] = useState("")
  const [expression, setExpression] = useState("")

  const handleAddAttribute = () => {
    if (!newAttrKey.trim()) return

    const newAttr: ConsumerAttribute = {
      key: newAttrKey,
      type: newAttrType,
      mappingType,
    }

    if (mappingType === "direct") {
      newAttr.producerAttributeKey = producerAttrKey
    } else if (mappingType === "hardcoded") {
      newAttr.value = hardcodedValue
    } else if (mappingType === "expression") {
      newAttr.expression = expression
    }

    setAttributes([...attributes, newAttr])
    setNewAttrKey("")
    setNewAttrType("string")
    setMappingType("direct")
    setProducerAttrKey("")
    setHardcodedValue("")
    setExpression("")
  }

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !webhookUrl.trim()) return

    const consumerData = {
      producerId,
      name,
      webhookUrl,
      attributes,
      status,
    }

    if (initialConsumer) {
      updateConsumer(initialConsumer.id, consumerData)
    } else {
      const consumer: Consumer = {
        id: generateId(),
        ...consumerData,
        createdAt: new Date(),
      }
      addConsumer(consumer)
    }

    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Consumer Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., SendEmail"
            className="bg-input border-border"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Webhook URL</label>
          <Input
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://..."
            type="url"
            className="bg-input border-border"
          />
        </div>
      </div>

      <Card className="p-4 bg-secondary/30 border-border">
        <h3 className="text-sm font-semibold mb-4">Attribute Mapping</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Producer Attributes</h4>
            <div className="space-y-2">
              {producer.attributes.map((attr) => (
                <div key={attr.key} className="p-2 bg-card rounded border border-border text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{attr.key}</span>
                    <AttributeBadge type={attr.type} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Consumer Attributes</h4>
            <div className="space-y-2">
              {attributes.length === 0 ? (
                <p className="text-xs text-muted-foreground">No attributes mapped yet</p>
              ) : (
                attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-card rounded border border-border text-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{attr.key}</span>
                      <AttributeBadge type={attr.type} />
                      {attr.mappingType === "direct" && (
                        <span className="text-muted-foreground text-xs">← {attr.producerAttributeKey}</span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttribute(idx)}
                      className="opacity-0 group-hover:opacity-100 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-3 bg-card rounded-md border border-border space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={newAttrKey}
              onChange={(e) => setNewAttrKey(e.target.value)}
              placeholder="New attribute key"
              className="bg-input border-border text-sm"
            />
            <Select value={newAttrType} onValueChange={(val) => setNewAttrType(val as AttributeType)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="int">int</SelectItem>
                <SelectItem value="string">string</SelectItem>
                <SelectItem value="object">object</SelectItem>
                <SelectItem value="array">array</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={mappingType} onValueChange={(val) => setMappingType(val as MappingType)}>
            <SelectTrigger className="bg-input border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="direct">Direct Mapping</SelectItem>
              <SelectItem value="hardcoded">Hardcoded Value</SelectItem>
              <SelectItem value="expression">Expression</SelectItem>
            </SelectContent>
          </Select>

          {mappingType === "direct" && (
            <Select value={producerAttrKey} onValueChange={setProducerAttrKey}>
              <SelectTrigger className="bg-input border-border text-sm">
                <SelectValue placeholder="Select producer attribute" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {producer.attributes.map((attr) => (
                  <SelectItem key={attr.key} value={attr.key}>
                    {attr.key} ({attr.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {mappingType === "hardcoded" && (
            <Input
              value={hardcodedValue}
              onChange={(e) => setHardcodedValue(e.target.value)}
              placeholder="Enter value"
              className="bg-input border-border text-sm"
            />
          )}

          {mappingType === "expression" && (
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g., ${userId} * 2"
              className="bg-input border-border text-sm"
            />
          )}

          <Button
            type="button"
            onClick={handleAddAttribute}
            variant="outline"
            size="sm"
            className="w-full gap-2 bg-transparent"
          >
            <Plus className="w-4 h-4" />
            Add Mapping
          </Button>
        </div>
      </Card>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1">
          {initialConsumer ? "Update Consumer" : "Create Consumer"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

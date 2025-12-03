"use client"

import type React from "react"

import { useState } from "react"
import type { Producer, Attribute, AttributeType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"
import { AttributeBadge } from "./attribute-badge"

interface ProducerFormProps {
  initialProducer?: Producer
  onSubmit: (producer: Omit<Producer, "id" | "createdAt" | "endpoint">) => void
  onCancel: () => void
}

export function ProducerForm({ initialProducer, onSubmit, onCancel }: ProducerFormProps) {
  const [name, setName] = useState(initialProducer?.name || "")
  const [description, setDescription] = useState(initialProducer?.description || "")
  const [status, setStatus] = useState<"active" | "inactive">(initialProducer?.status || "active")
  const [attributes, setAttributes] = useState<Attribute[]>(initialProducer?.attributes || [])

  const [newAttrKey, setNewAttrKey] = useState("")
  const [newAttrType, setNewAttrType] = useState<AttributeType>("string")
  const [newAttrDefault, setNewAttrDefault] = useState("")

  const handleAddAttribute = () => {
    if (!newAttrKey.trim()) return

    setAttributes([
      ...attributes,
      {
        key: newAttrKey,
        type: newAttrType,
        defaultValue: newAttrDefault || undefined,
      },
    ])

    setNewAttrKey("")
    setNewAttrType("string")
    setNewAttrDefault("")
  }

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name,
      description,
      attributes,
      status,
    })
  }

  return (
    <Card className="p-6 bg-card border-border">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Producer Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., UserSignup"
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Attributes</label>
          <div className="space-y-2">
            {attributes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No attributes yet</p>
            ) : (
              attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-3 bg-secondary/50 rounded-md border border-border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-mono text-sm font-medium">{attr.key}</span>
                    <AttributeBadge type={attr.type} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttribute(idx)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-secondary/30 rounded-md border border-border space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
                placeholder="Key"
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
              <Input
                value={newAttrDefault}
                onChange={(e) => setNewAttrDefault(e.target.value)}
                placeholder="Default value"
                className="bg-input border-border text-sm"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddAttribute}
              variant="outline"
              size="sm"
              className="w-full gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Add Attribute
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {initialProducer ? "Update Producer" : "Create Producer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

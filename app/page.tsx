"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import type { Producer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { ProducerForm } from "@/components/producer-form"
import { ProducerDetail } from "@/components/producer-detail"
import { AttributeBadge } from "@/components/attribute-badge"

export default function Home() {
  const { producers, addProducer, updateProducer, deleteProducer, generateId } = useStore()

  const [showForm, setShowForm] = useState(false)
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null)
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null)

  const handleCreateProducer = (data: Omit<Producer, "id" | "createdAt" | "endpoint">) => {
    const id = generateId()
    const producer: Producer = {
      ...data,
      id,
      createdAt: new Date(),
      endpoint: `/api/producers/${id}`,
    }
    addProducer(producer)
    setShowForm(false)
    setSelectedProducerId(id)
  }

  const handleDeleteProducer = (id: string) => {
    if (window.confirm("Delete this producer and all its consumers?")) {
      deleteProducer(id)
      if (selectedProducerId === id) {
        setSelectedProducerId(null)
      }
    }
  }

  if (selectedProducerId && producers.find((p) => p.id === selectedProducerId)) {
    return <ProducerDetail producerId={selectedProducerId} onBack={() => setSelectedProducerId(null)} />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Manage producers and consumers</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Producer
          </Button>
        </div>

        {showForm && (
          <div className="mb-8">
            <ProducerForm onSubmit={handleCreateProducer} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <div className="grid gap-4">
          {producers.length === 0 ? (
            <Card className="p-12 text-center border-border">
              <p className="text-muted-foreground mb-4">No producers yet</p>
            </Card>
          ) : (
            producers.map((producer) => (
              <Card
                key={producer.id}
                className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors border-border"
                onClick={() => setSelectedProducerId(producer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{producer.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          producer.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {producer.status}
                      </span>
                    </div>
                    {producer.description && (
                      <p className="text-sm text-muted-foreground mb-3">{producer.description}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {producer.attributes.map((attr) => (
                        <div key={attr.key} className="flex items-center gap-2 text-xs">
                          <span className="font-mono">{attr.key}</span>
                          <AttributeBadge type={attr.type} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProducer(producer.id)
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

"use client"

import { useStore } from "@/lib/store"
import type { Consumer } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Plus, Settings, Trash2, Copy } from "lucide-react"
import { useState } from "react"
import { ConsumerForm } from "./consumer-form"
import { AttributeBadge } from "./attribute-badge"
import { PayloadPreview } from "./payload-preview"

interface ProducerDetailProps {
  producerId: string
  onBack: () => void
}

export function ProducerDetail({ producerId, onBack }: ProducerDetailProps) {
  const { producers, getConsumersByProducerId, deleteConsumer, updateProducer } = useStore()

  const producer = producers.find((p) => p.id === producerId)
  const consumers = getConsumersByProducerId(producerId)

  const [showConsumerForm, setShowConsumerForm] = useState(false)
  const [editingConsumer, setEditingConsumer] = useState<Consumer | null>(null)
  const [showPayloadPreview, setShowPayloadPreview] = useState(false)

  if (!producer) return null

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(producer.endpoint)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          {/* Left Side - Producer Info (1/3) */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <div className="mb-4">
                <h1 className="text-3xl font-bold">{producer.name}</h1>
                {producer.description && <p className="text-muted-foreground">{producer.description}</p>}
              </div>

              <Card className="p-6 border-border space-y-4">
                <div>
                  <h2 className="text-sm font-semibold mb-2">Endpoint</h2>
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md border border-border">
                    <code className="font-mono text-sm flex-1 break-all">{producer.endpoint}</code>
                    <Button variant="ghost" size="sm" onClick={handleCopyEndpoint} className="text-accent shrink-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold mb-2">Attributes</h2>
                  <div className="flex gap-2 flex-wrap">
                    {producer.attributes.map((attr) => (
                      <div
                        key={attr.key}
                        className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md border border-border"
                      >
                        <span className="font-mono text-sm">{attr.key}</span>
                        <AttributeBadge type={attr.type} />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setShowPayloadPreview(true)} variant="outline" className="w-full gap-2">
                  Test Webhook
                </Button>
              </Card>
            </div>
          </div>

          {/* Right Side - Consumers (Scrollable) (2/3) */}
          <div className="flex flex-col min-h-0 lg:col-span-2">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-2xl font-bold">Consumers ({consumers.length})</h2>
              <Button
                onClick={() => {
                  setEditingConsumer(null)
                  setShowConsumerForm(true)
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Consumer
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {showConsumerForm && (
                <Card className="p-6 border-border">
                  <ConsumerForm
                    producerId={producerId}
                    producer={producer}
                    initialConsumer={editingConsumer || undefined}
                    onSubmit={() => {
                      setShowConsumerForm(false)
                      setEditingConsumer(null)
                    }}
                    onCancel={() => {
                      setShowConsumerForm(false)
                      setEditingConsumer(null)
                    }}
                  />
                </Card>
              )}

              {consumers.length === 0 ? (
                <Card className="p-8 text-center border-border">
                  <p className="text-muted-foreground mb-4">No consumers yet</p>
                </Card>
              ) : (
                consumers.map((consumer) => (
                  <Card key={consumer.id} className="p-4 border-border hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{consumer.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                              consumer.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {consumer.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mb-3 break-all">{consumer.webhookUrl}</p>
                        
                        {/* Attribute Mappings */}
                        <div className="space-y-1.5">
                          {consumer.attributes.map((attr, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs flex-wrap">
                              <span className="font-mono text-muted-foreground">{attr.key}</span>
                              <AttributeBadge type={attr.type} />
                              {attr.mappingType === "direct" && attr.producerAttributeKey && (
                                <span className="text-muted-foreground">← {attr.producerAttributeKey}</span>
                              )}
                              {attr.mappingType === "hardcoded" && (
                                <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                  = "{attr.value}"
                                </span>
                              )}
                              {attr.mappingType === "expression" && attr.expression && (
                                <span className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono truncate max-w-[150px]">
                                  ƒ {attr.expression}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingConsumer(consumer)
                            setShowConsumerForm(true)
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Delete this consumer?")) {
                              deleteConsumer(consumer.id)
                            }
                          }}
                          className="text-destructive"
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
        </div>

        {showPayloadPreview && <PayloadPreview producer={producer} onClose={() => setShowPayloadPreview(false)} />}
      </div>
    </div>
  )
}

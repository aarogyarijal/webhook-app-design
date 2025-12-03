"use client"

import { useState } from "react"
import type { Producer } from "@/lib/types"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { X, Copy, Play, CheckCircle, AlertCircle } from "lucide-react"
import { transformPayload, validatePayload } from "@/lib/transformations"

interface PayloadPreviewProps {
  producer: Producer
  onClose: () => void
}

export function PayloadPreview({ producer, onClose }: PayloadPreviewProps) {
  const { getConsumersByProducerId } = useStore()
  const consumers = getConsumersByProducerId(producer.id)

  const [testPayload, setTestPayload] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    producer.attributes.forEach((attr) => {
      switch (attr.type) {
        case "int":
          initial[attr.key] = 0
          break
        case "string":
          initial[attr.key] = ""
          break
        case "object":
          initial[attr.key] = {}
          break
        case "array":
          initial[attr.key] = []
          break
      }
    })
    return initial
  })

  const [selectedConsumerId, setSelectedConsumerId] = useState<string | null>(
    consumers.length > 0 ? consumers[0].id : null,
  )

  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePayload = (key: string, value: string) => {
    setTestPayload((prev) => ({ ...prev, [key]: value }))
  }

  const getDisplayValue = (value: any): string => {
    if (typeof value === "string") {
      return value
    }
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  const handleSendTest = async () => {
    if (!selectedConsumer) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: selectedConsumer.webhookUrl,
          payload: transformedPayload,
        }),
      })

      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedConsumer = consumers.find((c) => c.id === selectedConsumerId)
  const validation = validatePayload(testPayload, producer)
  const transformedPayload = selectedConsumer ? transformPayload(testPayload, selectedConsumer, producer) : null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-lg font-semibold">Test Webhook</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Producer Payload</h3>
            <div className="space-y-2">
              {producer.attributes.map((attr) => (
                <div key={attr.key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {attr.key} ({attr.type})
                  </label>
                  <Input
                    value={getDisplayValue(testPayload[attr.key])}
                    onChange={(e) => handleUpdatePayload(attr.key, e.target.value)}
                    className="font-mono text-sm bg-input border-border"
                  />
                </div>
              ))}
            </div>
            {!validation.valid && (
              <div className="mt-3 p-2 bg-destructive/20 border border-destructive/30 rounded text-xs text-destructive">
                {validation.errors.join(", ")}
              </div>
            )}
          </div>

          {consumers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Select Consumer</h3>
              <div className="space-y-2">
                {consumers.map((consumer) => (
                  <button
                    key={consumer.id}
                    onClick={() => {
                      setSelectedConsumerId(consumer.id)
                      setTestResult(null)
                    }}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      selectedConsumerId === consumer.id
                        ? "bg-accent/20 border-accent"
                        : "bg-secondary/30 border-border hover:bg-secondary/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{consumer.name}</p>
                    <p className="text-xs text-muted-foreground">{consumer.webhookUrl}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {transformedPayload && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Transformed Payload</h3>
              <div className="p-4 bg-secondary/30 rounded border border-border font-mono text-sm overflow-x-auto max-h-48">
                <pre>{JSON.stringify(transformedPayload, null, 2)}</pre>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(transformedPayload))}
                className="mt-2 gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Payload
              </Button>
            </div>
          )}

          {testResult && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                {testResult.success ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Test Result: Success
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Test Result: Failed
                  </>
                )}
              </h3>
              <div className="p-4 bg-secondary/30 rounded border border-border font-mono text-sm overflow-x-auto max-h-48">
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}

          <Button
            onClick={handleSendTest}
            className="w-full gap-2"
            disabled={!validation.valid || !transformedPayload || isLoading}
          >
            <Play className="w-4 h-4" />
            {isLoading ? "Sending..." : "Send Test Request"}
          </Button>
        </div>
      </Card>
    </div>
  )
}

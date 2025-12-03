// Data transformation logic for mapping producer to consumer attributes

import type { Producer, Consumer } from "./types"

export function transformPayload(
  producerData: Record<string, any>,
  consumer: Consumer,
  producer: Producer,
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const consumerAttr of consumer.attributes) {
    const { key, mappingType, producerAttributeKey, value, expression } = consumerAttr

    try {
      if (mappingType === "direct" && producerAttributeKey) {
        result[key] = producerData[producerAttributeKey]
      } else if (mappingType === "hardcoded") {
        result[key] = value
      } else if (mappingType === "expression" && expression) {
        result[key] = evaluateExpression(expression, producerData)
      }
    } catch (error) {
      console.error(`[v0] Error transforming attribute ${key}:`, error)
      result[key] = null
    }
  }

  return result
}

export function evaluateExpression(expression: string, data: Record<string, any>): any {
  try {
    // Create a safe evaluation context with the data values
    const context: Record<string, any> = {}

    // First, replace ${key} patterns with variable references
    let evaluable = expression
    const templateMatches = expression.match(/\$\{([^}]+)\}/g) || []

    for (const match of templateMatches) {
      const key = match.slice(2, -1) // Remove ${ and }
      const value = getNestedValue(data, key)
      context[key] = value
    }

    // Replace ${key} with just key for evaluation
    evaluable = evaluable.replace(/\$\{([^}]+)\}/g, "$1")

    // Create function with context variables as parameters
    const keys = Object.keys(context)
    const values = Object.values(context)

    // Validate the expression doesn't contain dangerous patterns
    if (/[;`]|function|eval|import|export|class/.test(evaluable)) {
      throw new Error("Invalid expression: contains forbidden patterns")
    }

    const func = new Function(...keys, `return (${evaluable})`)
    return func(...values)
  } catch (error) {
    console.error("[v0] Error evaluating expression:", (error as Error).message)
    return null
  }
}

export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, prop) => current?.[prop], obj)
}

export function validatePayload(
  payload: Record<string, any>,
  producer: Producer,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const attr of producer.attributes) {
    const value = payload[attr.key]

    if (value === undefined) {
      errors.push(`Missing required attribute: ${attr.key}`)
      continue
    }

    if (!validateType(value, attr.type)) {
      errors.push(`Invalid type for ${attr.key}: expected ${attr.type}, got ${typeof value}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

export function validateType(value: any, type: string): boolean {
  switch (type) {
    case "int":
      return Number.isInteger(value)
    case "string":
      return typeof value === "string"
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value)
    case "array":
      return Array.isArray(value)
    default:
      return true
  }
}

export function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    int: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    string: "bg-green-500/20 text-green-400 border-green-500/30",
    object: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    array: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  }
  return colors[type] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
}

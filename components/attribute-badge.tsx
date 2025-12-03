import { getTypeColor } from "@/lib/transformations"
import { Badge } from "@/components/ui/badge"

export function AttributeBadge({ type }: { type: string }) {
  return <Badge className={`${getTypeColor(type)} font-mono text-xs`}>{type}</Badge>
}

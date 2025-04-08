"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Platform {
  name: string
  value: string
}

interface SocialLinksProps {
  platforms: Platform[]
  onChange: (platforms: Platform[]) => void
}

export function SocialLinks({ platforms, onChange }: SocialLinksProps) {
  const [newPlatform, setNewPlatform] = useState({ name: "", value: "" })

  const addPlatform = () => {
    if (newPlatform.name && newPlatform.value) {
      onChange([...platforms, { ...newPlatform }])
      setNewPlatform({ name: "", value: "" })
    }
  }

  const removePlatform = (index: number) => {
    const updatedPlatforms = [...platforms]
    updatedPlatforms.splice(index, 1)
    onChange(updatedPlatforms)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addPlatform()
    }
  }

  return (
    <div className="space-y-4">
      <Label>Other Platforms (optional)</Label>

      <div className="flex flex-wrap gap-2 mb-4">
        {platforms.map((platform, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
            <span className="font-semibold">{platform.name}:</span> {platform.value}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 ml-1 p-0 text-body-fg hover:text-white hover:bg-destructive"
              onClick={() => removePlatform(index)}
            >
              <Trash2 className="h-3 w-3" />
              <span className="sr-only">Remove</span>
            </Button>
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="col-span-1">
          <Input
            placeholder="Platform (e.g. discord)"
            value={newPlatform.name}
            onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="col-span-1">
          <Input
            placeholder="Username (e.g. orangc)"
            value={newPlatform.value}
            onChange={(e) => setNewPlatform({ ...newPlatform, value: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="col-span-1">
          <Button
            onClick={addPlatform}
            disabled={!newPlatform.name || !newPlatform.value}
            className="w-full bg-accent hover:bg-hover-accent text-accent-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

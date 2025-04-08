"use client"

import type { KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface DescriptionFormProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function DescriptionForm({ data, updateData, onNext, onBack }: DescriptionFormProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onNext()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
        <CardDescription>Provide optional details about your subdomain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Input
            id="description"
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="A brief description of your subdomain"
          />
          <p className="text-sm text-muted-foreground">Keep your description short and concise.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo">Repository URL (optional)</Label>
          <Input
            id="repo"
            value={data.repo}
            onChange={(e) => updateData({ repo: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/your-username/your-website-repository"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} className="bg-accent hover:bg-hover-accent text-accent-foreground">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

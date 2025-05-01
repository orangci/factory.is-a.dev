"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JsonPreviewProps {
  data: any
  onBack: () => void
}

export function JsonPreview({ data, onBack }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false)

  const generateJson = () => {
    const { subdomain, username, email, platforms, description, repo, records, proxied, redirect_config } = data

    // Build owner object
    const owner: any = {
      username,
    }

    if (email) {
      owner.email = email
    }

    // Add platforms to owner
    platforms.forEach((platform: any) => {
      owner[platform.name] = platform.value
    })

    // Build the final JSON with description and repo first
    const jsonObj: any = {}

    // Add optional fields first
    if (description) {
      jsonObj.description = description
    }

    if (repo) {
      jsonObj.repo = repo
    }

    // Add owner
    jsonObj.owner = owner

    // Only add records if there are records
    if (Object.keys(records).length > 0) {
      jsonObj.records = records
    }

    if (proxied) {
      jsonObj.proxied = true
    }

    // Add redirect_config if it exists and has custom paths
    if (redirect_config && Object.keys(redirect_config.custom_paths || {}).length > 0) {
      jsonObj.redirect_config = redirect_config
    }

    return JSON.stringify(jsonObj, null, 2)
  }

  const jsonContent = generateJson()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJson = () => {
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.subdomain}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFilePath = () => {
    return `domains/${data.subdomain}.json`
  }

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Your JSON</CardTitle>
        <CardDescription className="text-sm sm:text-base">Your subdomain configuration is ready</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm font-medium text-body-fg">
              File path: <code className="bg-background/30 px-1 py-0.5 rounded">{getFilePath()}</code>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-body-fg">
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadJson} className="text-body-fg">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          <div className="relative w-full">
            <ScrollArea className="h-[250px] sm:h-[400px] w-full rounded-md border border-border">
              <pre className="bg-background/30 p-4 text-body-fg w-full">
                <code className="whitespace-pre-wrap break-all">{jsonContent}</code>
              </pre>
            </ScrollArea>
          </div>
        </div>

        <div className="bg-accent/20 p-4 rounded-md text-body-fg">
          <h3 className="font-semibold mb-2">Next Steps</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Create a new file at <code className="bg-background/30 px-1 py-0.5 rounded">{getFilePath()}</code> in your
              fork of{" "}
              <a href="https://github.com/is-a-dev/register" className="text-accent underline hover:no-underline">
                is-a-dev/register
              </a>
              .
            </li>
            <li>Copy the JSON content above into the file.</li>
            <li>
              Create a pull request to the{" "}
              <a href="https://github.com/is-a-dev/register" className="text-accent underline hover:no-underline">
                is-a-dev/register
              </a>{" "}
              repository.
            </li>
            <li>Wait for your pull request to be reviewed and merged.</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter className="px-4 sm:px-6">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}

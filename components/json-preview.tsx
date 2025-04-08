"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy, Download } from "lucide-react"

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

    // Only add record if there are records
    if (Object.keys(records).length > 0) {
      jsonObj.record = records
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
      <CardHeader>
        <CardTitle>Your JSON</CardTitle>
        <CardDescription>Your subdomain configuration is ready</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
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

          <div className="relative">
            <pre className="bg-background/30 p-4 rounded-md overflow-auto max-h-[400px] text-body-fg">
              <code>{jsonContent}</code>
            </pre>
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
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { useState, useEffect, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Plus, Trash2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { validateRecordValue } from "@/lib/utils"

interface RecordSelectorProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

type RecordType = "CNAME" | "A" | "AAAA" | "URL" | "MX" | "TXT" | "NS" | "SRV" | "CAA" | "DS" | "TLSA"

export function RecordSelector({ data, updateData, onNext, onBack }: RecordSelectorProps) {
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>([])
  const [recordErrors, setRecordErrors] = useState<Record<string, string>>({})
  const [showRedirectConfig, setShowRedirectConfig] = useState(false)
  const [noRecordError, setNoRecordError] = useState<string | null>(null)

  // Initialize selected types from data
  useEffect(() => {
    const types: RecordType[] = []
    if (data.records) {
      if (data.records.CNAME) types.push("CNAME")
      if (data.records.A) types.push("A")
      if (data.records.AAAA) types.push("AAAA")
      if (data.records.URL) types.push("URL")
      if (data.records.MX) types.push("MX")
      if (data.records.TXT) types.push("TXT")
      if (data.records.NS) types.push("NS")
      if (data.records.SRV) types.push("SRV")
      if (data.records.CAA) types.push("CAA")
      if (data.records.DS) types.push("DS")
      if (data.records.TLSA) types.push("TLSA")
    }
    setSelectedTypes(types)
  }, [])

  // Initialize redirect_config if URL is selected
  useEffect(() => {
    if (selectedTypes.includes("URL") && !data.redirect_config) {
      updateData({
        redirect_config: {
          custom_paths: {},
          redirect_paths: false,
        },
      })
      setShowRedirectConfig(true)
    }
  }, [selectedTypes])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNext()
    }
  }

  const handleRecordTypeToggle = (type: RecordType, isSelected: boolean) => {
    let newSelectedTypes: RecordType[]

    if (isSelected) {
      // Adding a record type

      // Check if CNAME is being added and other records exist
      if (type === "CNAME" && selectedTypes.length > 0 && !data.proxied) {
        setRecordErrors({
          ...recordErrors,
          CNAME: "CNAME can only be combined with other records if proxied is enabled",
        })
        return
      }

      // Check if other records are being added when CNAME exists
      if (selectedTypes.includes("CNAME") && !data.proxied) {
        setRecordErrors({
          ...recordErrors,
          CNAME: "CNAME can only be combined with other records if proxied is enabled",
        })
        return
      }

      // Check if NS is being added with other records
      if (type === "NS" && selectedTypes.length > 0) {
        setRecordErrors({
          ...recordErrors,
          NS: "NS records cannot be combined with other record types",
        })
        return
      }

      // Check if other records are being added when NS exists
      if (selectedTypes.includes("NS")) {
        setRecordErrors({
          ...recordErrors,
          NS: "NS records cannot be combined with other record types",
        })
        return
      }

      newSelectedTypes = [...selectedTypes, type]
    } else {
      // Removing a record type
      newSelectedTypes = selectedTypes.filter((t) => t !== type)

      // Clear errors for this record type
      const newErrors = { ...recordErrors }
      delete newErrors[type]
      setRecordErrors(newErrors)

      // If URL is removed, remove redirect_config
      if (type === "URL" && data.redirect_config) {
        const newData = { ...data }
        delete newData.redirect_config
        updateData(newData)
        setShowRedirectConfig(false)
      }
    }

    setSelectedTypes(newSelectedTypes)
    // Clear no record error when a record is selected
    if (newSelectedTypes.length > 0) {
      setNoRecordError(null)
    }

    // Initialize the record structure for new types
    const newRecords = { ...data.records }

    if (isSelected) {
      // Add the new record type with default value
      switch (type) {
        case "CNAME":
          newRecords.CNAME = ""
          break
        case "A":
        case "AAAA":
        case "NS":
          newRecords[type] = [""]
          break
        case "URL":
          newRecords.URL = ""
          break
        case "MX":
          newRecords.MX = [{ target: "", priority: 10 }]
          break
        case "TXT":
          newRecords.TXT = ""
          break
        case "SRV":
          newRecords.SRV = [{ priority: 10, weight: 5, port: 8080, target: "" }]
          break
        case "CAA":
          newRecords.CAA = [{ flags: 0, tag: "issue", value: "" }]
          break
        case "DS":
          newRecords.DS = [{ key_tag: 0, algorithm: 13, digest_type: 2, digest: "" }]
          break
        case "TLSA":
          newRecords.TLSA = [{ usage: 1, selector: 1, matchingType: 1, certificate: "" }]
          break
        default:
          break
      }
    } else {
      // Remove the record type
      delete newRecords[type]
    }

    updateData({ records: newRecords })
  }

  const handleCNAMEChange = (value: string) => {
    // Validate CNAME format
    const error = validateRecordValue("CNAME", value)
    if (error) {
      setRecordErrors({ ...recordErrors, CNAME: error })
    } else {
      const newErrors = { ...recordErrors }
      delete newErrors.CNAME
      setRecordErrors(newErrors)
    }

    updateData({ records: { ...data.records, CNAME: value } })
  }

  const handleURLChange = (value: string) => {
    // Validate URL format
    const error = validateRecordValue("URL", value)
    if (error) {
      setRecordErrors({ ...recordErrors, URL: error })
    } else {
      const newErrors = { ...recordErrors }
      delete newErrors.URL
      setRecordErrors(newErrors)
    }

    updateData({ records: { ...data.records, URL: value } })
  }

  const handleTXTChange = (value: string) => {
    updateData({ records: { ...data.records, TXT: value } })
  }

  const handleArrayRecordChange = (type: "A" | "AAAA" | "NS", index: number, value: string) => {
    const newArray = [...(data.records[type] || [""])]
    newArray[index] = value

    // Validate record format
    const error = validateRecordValue(type, value)
    if (error) {
      setRecordErrors({ ...recordErrors, [`${type}-${index}`]: error })
    } else {
      const newErrors = { ...recordErrors }
      delete newErrors[`${type}-${index}`]
      setRecordErrors(newErrors)
    }

    updateData({ records: { ...data.records, [type]: newArray } })
  }

  const addArrayItem = (type: "A" | "AAAA" | "NS") => {
    const newArray = [...(data.records[type] || []), ""]
    updateData({ records: { ...data.records, [type]: newArray } })
  }

  const removeArrayItem = (type: "A" | "AAAA" | "NS", index: number) => {
    const newArray = [...(data.records[type] || [])]
    newArray.splice(index, 1)

    // Remove error for this item
    const newErrors = { ...recordErrors }
    delete newErrors[`${type}-${index}`]
    setRecordErrors(newErrors)

    updateData({ records: { ...data.records, [type]: newArray.length ? newArray : [""] } })
  }

  const handleMXRecordChange = (index: number, field: "target" | "priority", value: string | number) => {
    const newArray = [...(data.records.MX || [{ target: "", priority: 10 }])]
    newArray[index] = { ...newArray[index], [field]: value }

    // Validate MX target
    if (field === "target") {
      const error = validateRecordValue("MX", value as string)
      if (error) {
        setRecordErrors({ ...recordErrors, [`MX-${index}`]: error })
      } else {
        const newErrors = { ...recordErrors }
        delete newErrors[`MX-${index}`]
        setRecordErrors(newErrors)
      }
    }

    updateData({ records: { ...data.records, MX: newArray } })
  }

  const addMXItem = () => {
    const newArray = [...(data.records.MX || []), { target: "", priority: 10 }]
    updateData({ records: { ...data.records, MX: newArray } })
  }

  const removeMXItem = (index: number) => {
    const newArray = [...(data.records.MX || [])]
    newArray.splice(index, 1)

    // Remove error for this item
    const newErrors = { ...recordErrors }
    delete newErrors[`MX-${index}`]
    setRecordErrors(newErrors)

    updateData({ records: { ...data.records, MX: newArray.length ? newArray : [{ target: "", priority: 10 }] } })
  }

  const handleSRVRecordChange = (
    index: number,
    field: "priority" | "weight" | "port" | "target",
    value: string | number,
  ) => {
    const newArray = [...(data.records.SRV || [{ priority: 10, weight: 5, port: 8080, target: "" }])]
    newArray[index] = { ...newArray[index], [field]: value }

    // Validate SRV target
    if (field === "target") {
      const error = validateRecordValue("SRV", value as string)
      if (error) {
        setRecordErrors({ ...recordErrors, [`SRV-${index}`]: error })
      } else {
        const newErrors = { ...recordErrors }
        delete newErrors[`SRV-${index}`]
        setRecordErrors(newErrors)
      }
    }

    updateData({ records: { ...data.records, SRV: newArray } })
  }

  const addSRVItem = () => {
    const newArray = [...(data.records.SRV || []), { priority: 10, weight: 5, port: 8080, target: "" }]
    updateData({ records: { ...data.records, SRV: newArray } })
  }

  const removeSRVItem = (index: number) => {
    const newArray = [...(data.records.SRV || [])]
    newArray.splice(index, 1)

    // Remove error for this item
    const newErrors = { ...recordErrors }
    delete newErrors[`SRV-${index}`]
    setRecordErrors(newErrors)

    updateData({
      records: {
        ...data.records,
        SRV: newArray.length ? newArray : [{ priority: 10, weight: 5, port: 8080, target: "" }],
      },
    })
  }

  const handleCAARecordChange = (index: number, field: "flags" | "tag" | "value", value: string | number) => {
    const newArray = [...(data.records.CAA || [{ flags: 0, tag: "issue", value: "" }])]
    newArray[index] = { ...newArray[index], [field]: value }
    updateData({ records: { ...data.records, CAA: newArray } })
  }

  const addCAAItem = () => {
    const newArray = [...(data.records.CAA || []), { flags: 0, tag: "issue", value: "" }]
    updateData({ records: { ...data.records, CAA: newArray } })
  }

  const removeCAAItem = (index: number) => {
    const newArray = [...(data.records.CAA || [])]
    newArray.splice(index, 1)
    updateData({
      records: { ...data.records, CAA: newArray.length ? newArray : [{ flags: 0, tag: "issue", value: "" }] },
    })
  }

  const handleDSRecordChange = (
    index: number,
    field: "key_tag" | "algorithm" | "digest_type" | "digest",
    value: string | number,
  ) => {
    const newArray = [...(data.records.DS || [{ key_tag: 0, algorithm: 13, digest_type: 2, digest: "" }])]
    newArray[index] = { ...newArray[index], [field]: value }
    updateData({ records: { ...data.records, DS: newArray } })
  }

  const addDSItem = () => {
    const newArray = [...(data.records.DS || []), { key_tag: 0, algorithm: 13, digest_type: 2, digest: "" }]
    updateData({ records: { ...data.records, DS: newArray } })
  }

  const removeDSItem = (index: number) => {
    const newArray = [...(data.records.DS || [])]
    newArray.splice(index, 1)
    updateData({
      records: {
        ...data.records,
        DS: newArray.length ? newArray : [{ key_tag: 0, algorithm: 13, digest_type: 2, digest: "" }],
      },
    })
  }

  const handleTLSARecordChange = (
    index: number,
    field: "usage" | "selector" | "matchingType" | "certificate",
    value: string | number,
  ) => {
    const newArray = [...(data.records.TLSA || [{ usage: 1, selector: 1, matchingType: 1, certificate: "" }])]
    newArray[index] = { ...newArray[index], [field]: value }
    updateData({ records: { ...data.records, TLSA: newArray } })
  }

  const addTLSAItem = () => {
    const newArray = [...(data.records.TLSA || []), { usage: 1, selector: 1, matchingType: 1, certificate: "" }]
    updateData({ records: { ...data.records, TLSA: newArray } })
  }

  const removeTLSAItem = (index: number) => {
    const newArray = [...(data.records.TLSA || [])]
    newArray.splice(index, 1)
    updateData({
      records: {
        ...data.records,
        TLSA: newArray.length ? newArray : [{ usage: 1, selector: 1, matchingType: 1, certificate: "" }],
      },
    })
  }

  const toggleProxied = () => {
    // Clear CNAME combination errors when proxied is enabled
    if (!data.proxied && selectedTypes.includes("CNAME") && selectedTypes.length > 1) {
      const newErrors = { ...recordErrors }
      delete newErrors.CNAME
      setRecordErrors(newErrors)
    }

    updateData({ proxied: !data.proxied })
  }

  const handleRedirectPathsToggle = () => {
    updateData({
      redirect_config: {
        ...data.redirect_config,
        redirect_paths: !data.redirect_config?.redirect_paths,
      },
    })
  }

  const handleCustomPathChange = (index: number, field: "path" | "url", value: string) => {
    const paths = data.redirect_config?.custom_paths || {}
    const entries = Object.entries(paths)

    if (field === "path") {
      // Update path key
      const oldPath = entries[index]?.[0] || ""
      const targetUrl = entries[index]?.[1] || ""

      // Remove old path
      const newPaths = { ...paths }
      delete newPaths[oldPath]

      // Add new path with same target
      newPaths[value] = targetUrl

      updateData({
        redirect_config: {
          ...data.redirect_config,
          custom_paths: newPaths,
        },
      })
    } else {
      // Update URL value
      const path = entries[index]?.[0] || ""

      updateData({
        redirect_config: {
          ...data.redirect_config,
          custom_paths: {
            ...paths,
            [path]: value,
          },
        },
      })
    }
  }

  const addCustomPath = () => {
    const paths = data.redirect_config?.custom_paths || {}
    updateData({
      redirect_config: {
        ...data.redirect_config,
        custom_paths: {
          ...paths,
          "/new-path": "https://example.com",
        },
      },
    })
  }

  const removeCustomPath = (index: number) => {
    const paths = data.redirect_config?.custom_paths || {}
    const entries = Object.entries(paths)
    const pathToRemove = entries[index]?.[0]

    if (pathToRemove) {
      const newPaths = { ...paths }
      delete newPaths[pathToRemove]

      updateData({
        redirect_config: {
          ...data.redirect_config,
          custom_paths: newPaths,
        },
      })
    }
  }

  const handleNext = () => {
    // Check if at least one record type is selected
    if (selectedTypes.length === 0) {
      setNoRecordError("Please select at least one record type before proceeding")
      return
    }

    // Check for any validation errors
    if (Object.values(recordErrors).some((error) => error && !error.includes("can only be combined"))) {
      return
    }

    onNext()
  }

  const renderRecordForms = () => {
    if (selectedTypes.length === 0) {
      return (
        <div className="text-center p-6 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground">
            Please select at least one record type above to configure your DNS records.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {selectedTypes.map((type) => {
          switch (type) {
            case "CNAME":
              return (
                <div key={type} className="space-y-2">
                  <Label htmlFor="cname-value">CNAME Value</Label>
                  <Input
                    id="cname-value"
                    value={data.records.CNAME || ""}
                    onChange={(e) => handleCNAMEChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="example.github.io"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the hostname that this subdomain should point to (without https:// or trailing slashes).
                  </p>
                  {recordErrors.CNAME && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recordErrors.CNAME}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )

            case "A":
              return (
                <div key={type} className="space-y-4">
                  <Label>A Records (IPv4 Addresses)</Label>
                  {(data.records.A || [""]).map((value: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => handleArrayRecordChange("A", index, e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="192.0.2.1"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("A", index)}
                        disabled={(data.records.A || []).length <= 1}
                        className="text-body-fg hover:text-white hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  {recordErrors[`A-${(data.records.A || [""]).length - 1}`] && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recordErrors[`A-${(data.records.A || [""]).length - 1}`]}</AlertDescription>
                    </Alert>
                  )}
                  <Button variant="outline" onClick={() => addArrayItem("A")} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add IPv4 Address
                  </Button>
                </div>
              )

            case "AAAA":
              return (
                <div key={type} className="space-y-4">
                  <Label>AAAA Records (IPv6 Addresses)</Label>
                  {(data.records.AAAA || [""]).map((value: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => handleArrayRecordChange("AAAA", index, e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("AAAA", index)}
                        disabled={(data.records.AAAA || []).length <= 1}
                        className="text-body-fg hover:text-white hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  {recordErrors[`AAAA-${(data.records.AAAA || [""]).length - 1}`] && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {recordErrors[`AAAA-${(data.records.AAAA || [""]).length - 1}`]}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button variant="outline" onClick={() => addArrayItem("AAAA")} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add IPv6 Address
                  </Button>
                </div>
              )

            case "URL":
              return (
                <div key={type} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url-value">URL Redirect</Label>
                    <Input
                      id="url-value"
                      value={data.records.URL || ""}
                      onChange={(e) => handleURLChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="https://example.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the URL that visitors should be redirected to.
                    </p>
                    {recordErrors.URL && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{recordErrors.URL}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {showRedirectConfig && (
                    <div className="space-y-4 border border-border rounded-md p-4 mt-4">
                      <h3 className="font-medium">Redirect Configuration</h3>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="redirect-paths"
                          checked={data.redirect_config?.redirect_paths || false}
                          onCheckedChange={handleRedirectPathsToggle}
                        />
                        <Label htmlFor="redirect-paths">Redirect paths</Label>
                      </div>

                      <div className="space-y-4">
                        <Label>Custom Paths</Label>
                        {Object.entries(data.redirect_config?.custom_paths || {}).map(([path, url], index) => (
                          <div key={index} className="grid grid-cols-5 gap-2">
                            <Input
                              value={path}
                              onChange={(e) => handleCustomPathChange(index, "path", e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="/path"
                              className="col-span-2"
                            />
                            <Input
                              value={url as string}
                              onChange={(e) => handleCustomPathChange(index, "url", e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="https://example.com"
                              className="col-span-2"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCustomPath(index)}
                              className="text-body-fg hover:text-white hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        ))}
                        <Button variant="outline" onClick={addCustomPath} className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Custom Path
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )

            case "MX":
              return (
                <div key={type} className="space-y-4">
                  <Label>MX Records (Mail Servers)</Label>
                  {(data.records.MX || [{ target: "", priority: 10 }]).map((record: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={record.priority}
                        onChange={(e) => handleMXRecordChange(index, "priority", Number.parseInt(e.target.value) || 10)}
                        onKeyDown={handleKeyDown}
                        placeholder="10"
                        className="w-20"
                        type="number"
                      />
                      <Input
                        value={record.target}
                        onChange={(e) => handleMXRecordChange(index, "target", e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="mx1.example.com"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMXItem(index)}
                        disabled={(data.records.MX || []).length <= 1}
                        className="text-body-fg hover:text-white hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  {recordErrors[`MX-${(data.records.MX || []).length - 1}`] && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recordErrors[`MX-${(data.records.MX || []).length - 1}`]}</AlertDescription>
                    </Alert>
                  )}
                  <Button variant="outline" onClick={addMXItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mail Server
                  </Button>
                </div>
              )

            case "TXT":
              return (
                <div key={type} className="space-y-2">
                  <Label htmlFor="txt-value">TXT Record</Label>
                  <Input
                    id="txt-value"
                    value={data.records.TXT || ""}
                    onChange={(e) => handleTXTChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="v=spf1 include:_spf.example.com ~all"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the text record value. This is often used for domain verification.
                  </p>
                </div>
              )

            case "NS":
              return (
                <div key={type} className="space-y-4">
                  <Label>NS Records (Name Servers)</Label>
                  <Alert className="mb-4 bg-accent/20 text-body-fg border-accent">
                    <AlertCircle className="h-4 w-4 text-accent" />
                    <AlertDescription>
                      A valid reason must be provided in order for NS record requests to be approved.
                    </AlertDescription>
                  </Alert>
                  {(data.records.NS || [""]).map((value: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => handleArrayRecordChange("NS", index, e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ns1.example.com"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem("NS", index)}
                        disabled={(data.records.NS || []).length <= 1}
                        className="text-body-fg hover:text-white hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                  {recordErrors[`NS-${(data.records.NS || [""]).length - 1}`] && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{recordErrors[`NS-${(data.records.NS || [""]).length - 1}`]}</AlertDescription>
                    </Alert>
                  )}
                  <Button variant="outline" onClick={() => addArrayItem("NS")} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Name Server
                  </Button>
                </div>
              )

            case "SRV":
              return (
                <div key={type} className="space-y-4">
                  <Label>SRV Records (Service Records)</Label>
                  {(data.records.SRV || [{ priority: 10, weight: 5, port: 8080, target: "" }]).map(
                    (record: any, index: number) => (
                      <div key={index} className="space-y-2 border border-border rounded-md p-3 mb-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor={`srv-priority-${index}`}>Priority</Label>
                            <Input
                              id={`srv-priority-${index}`}
                              value={record.priority}
                              onChange={(e) =>
                                handleSRVRecordChange(index, "priority", Number.parseInt(e.target.value) || 10)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="10"
                              type="number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`srv-weight-${index}`}>Weight</Label>
                            <Input
                              id={`srv-weight-${index}`}
                              value={record.weight}
                              onChange={(e) =>
                                handleSRVRecordChange(index, "weight", Number.parseInt(e.target.value) || 5)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="5"
                              type="number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`srv-port-${index}`}>Port</Label>
                            <Input
                              id={`srv-port-${index}`}
                              value={record.port}
                              onChange={(e) =>
                                handleSRVRecordChange(index, "port", Number.parseInt(e.target.value) || 8080)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="8080"
                              type="number"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`srv-target-${index}`}>Target</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`srv-target-${index}`}
                              value={record.target}
                              onChange={(e) => handleSRVRecordChange(index, "target", e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="srv.example.com"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSRVItem(index)}
                              disabled={(data.records.SRV || []).length <= 1}
                              className="text-body-fg hover:text-white hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                        {recordErrors[`SRV-${index}`] && (
                          <Alert variant="destructive" className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{recordErrors[`SRV-${index}`]}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ),
                  )}
                  <Button variant="outline" onClick={addSRVItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Service Record
                  </Button>
                </div>
              )

            case "CAA":
              return (
                <div key={type} className="space-y-4">
                  <Label>CAA Records (Certificate Authority Authorization)</Label>
                  {(data.records.CAA || [{ flags: 0, tag: "issue", value: "" }]).map((record: any, index: number) => (
                    <div key={index} className="space-y-2 border border-border rounded-md p-3 mb-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`caa-flags-${index}`}>Flags</Label>
                          <Input
                            id={`caa-flags-${index}`}
                            value={record.flags}
                            onChange={(e) =>
                              handleCAARecordChange(index, "flags", Number.parseInt(e.target.value) || 0)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="0"
                            type="number"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`caa-tag-${index}`}>Tag</Label>
                          <Select
                            value={record.tag}
                            onValueChange={(value) => handleCAARecordChange(index, "tag", value)}
                          >
                            <SelectTrigger id={`caa-tag-${index}`}>
                              <SelectValue placeholder="Select tag" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="issue">issue</SelectItem>
                              <SelectItem value="issuewild">issuewild</SelectItem>
                              <SelectItem value="iodef">iodef</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`caa-value-${index}`}>Value</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`caa-value-${index}`}
                            value={record.value}
                            onChange={(e) => handleCAARecordChange(index, "value", e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="letsencrypt.org"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCAAItem(index)}
                            disabled={(data.records.CAA || []).length <= 1}
                            className="text-body-fg hover:text-white hover:bg-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCAAItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add CAA Record
                  </Button>
                </div>
              )

            case "DS":
              return (
                <div key={type} className="space-y-4">
                  <Label>DS Records (Delegation Signer)</Label>
                  {(data.records.DS || [{ key_tag: 0, algorithm: 13, digest_type: 2, digest: "" }]).map(
                    (record: any, index: number) => (
                      <div key={index} className="space-y-2 border border-border rounded-md p-3 mb-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor={`ds-key-tag-${index}`}>Key Tag</Label>
                            <Input
                              id={`ds-key-tag-${index}`}
                              value={record.key_tag}
                              onChange={(e) =>
                                handleDSRecordChange(index, "key_tag", Number.parseInt(e.target.value) || 0)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="2371"
                              type="number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`ds-algorithm-${index}`}>Algorithm</Label>
                            <Input
                              id={`ds-algorithm-${index}`}
                              value={record.algorithm}
                              onChange={(e) =>
                                handleDSRecordChange(index, "algorithm", Number.parseInt(e.target.value) || 13)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="13"
                              type="number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`ds-digest-type-${index}`}>Digest Type</Label>
                            <Input
                              id={`ds-digest-type-${index}`}
                              value={record.digest_type}
                              onChange={(e) =>
                                handleDSRecordChange(index, "digest_type", Number.parseInt(e.target.value) || 2)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="2"
                              type="number"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`ds-digest-${index}`}>Digest</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`ds-digest-${index}`}
                              value={record.digest}
                              onChange={(e) => handleDSRecordChange(index, "digest", e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="C2074462471B81206F792AEC23469EF33DDC53538E8580DCCC92FD130C9A6096"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDSItem(index)}
                              disabled={(data.records.DS || []).length <= 1}
                              className="text-body-fg hover:text-white hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                  <Button variant="outline" onClick={addDSItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add DS Record
                  </Button>
                </div>
              )

            case "TLSA":
              return (
                <div key={type} className="space-y-4">
                  <Label>TLSA Records (TLS Authentication)</Label>
                  {(data.records.TLSA || [{ usage: 1, selector: 1, matchingType: 1, certificate: "" }]).map(
                    (record: any, index: number) => (
                      <div key={index} className="space-y-2 border border-border rounded-md p-3 mb-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor={`tlsa-usage-${index}`}>Usage</Label>
                            <Input
                              id={`tlsa-usage-${index}`}
                              value={record.usage}
                              onChange={(e) =>
                                handleTLSARecordChange(index, "usage", Number.parseInt(e.target.value) || 1)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="1"
                              type="number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tlsa-selector-${index}`}>Selector</Label>
                            <Input
                              id={`tlsa-selector-${index}`}
                              value={record.selector}
                              onChange={(e) =>
                                handleTLSARecordChange(index, "selector", Number.parseInt(e.target.value) || 1)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="1"
                              type="number"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`tlsa-matching-type-${index}`}>Matching Type</Label>
                            <Input
                              id={`tlsa-matching-type-${index}`}
                              value={record.matchingType}
                              onChange={(e) =>
                                handleTLSARecordChange(index, "matchingType", Number.parseInt(e.target.value) || 1)
                              }
                              onKeyDown={handleKeyDown}
                              placeholder="1"
                              type="number"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`tlsa-certificate-${index}`}>Certificate</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`tlsa-certificate-${index}`}
                              value={record.certificate}
                              onChange={(e) => handleTLSARecordChange(index, "certificate", e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="5B2D3A4F5E6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTLSAItem(index)}
                              disabled={(data.records.TLSA || []).length <= 1}
                              className="text-body-fg hover:text-white hover:bg-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                  <Button variant="outline" onClick={addTLSAItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add TLSA Record
                  </Button>
                </div>
              )

            default:
              return null
          }
        })}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>DNS Records</CardTitle>
        <CardDescription>Configure the DNS records for your subdomain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Record Types</Label>
          <div className="flex flex-wrap gap-2">
            {["CNAME", "A", "AAAA", "URL", "MX", "TXT", "NS", "SRV", "CAA", "DS", "TLSA"].map((type) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type as RecordType) ? "default" : "outline"}
                size="sm"
                onClick={() => handleRecordTypeToggle(type as RecordType, !selectedTypes.includes(type as RecordType))}
                className={
                  selectedTypes.includes(type as RecordType)
                    ? "bg-accent hover:bg-hover-accent text-accent-foreground"
                    : ""
                }
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <Switch id="proxied" checked={data.proxied} onCheckedChange={toggleProxied} className="switch" />
            <Label htmlFor="proxied">Enable Cloudflare proxy</Label>
          </div>

          {recordErrors.NS && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{recordErrors.NS}</AlertDescription>
            </Alert>
          )}

          {noRecordError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{noRecordError}</AlertDescription>
            </Alert>
          )}
        </div>

        {renderRecordForms()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          className="bg-accent hover:bg-hover-accent text-accent-foreground"
          disabled={Object.values(recordErrors).some((error) => error && !error.includes("can only be combined"))}
        >
          Preview JSON
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

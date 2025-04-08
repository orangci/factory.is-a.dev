"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserInfoForm } from "@/components/user-info-form"
import { DescriptionForm } from "@/components/description-form"
import { RecordSelector } from "@/components/record-selector"
import { JsonPreview } from "@/components/json-preview"
import { checkSubdomainAvailability } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

type Step = "subdomain" | "userInfo" | "description" | "records" | "preview"

interface SubdomainData {
  subdomain: string
  username: string
  email: string
  platforms: { name: string; value: string }[]
  description: string
  repo: string
  records: Record<string, any>
  proxied: boolean
  redirect_config?: {
    custom_paths?: Record<string, string>
    redirect_paths?: boolean
  }
}

export function SubdomainChecker() {
  const [currentStep, setCurrentStep] = useState<Step>("subdomain")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SubdomainData>({
    subdomain: "",
    username: "",
    email: "",
    platforms: [],
    description: "",
    repo: "",
    records: {},
    proxied: false,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedSubdomain = useDebounce(data.subdomain, 500)

  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Check subdomain availability as user types (after debounce)
  useEffect(() => {
    if (debouncedSubdomain && debouncedSubdomain.length > 0) {
      validateAndCheckSubdomain(false)
    } else {
      setIsAvailable(null)
      setError(null)
    }
  }, [debouncedSubdomain])

  const validateSubdomainFormat = async (subdomain: string): Promise<boolean> => {
    // Check if subdomain is at least 1 character
    if (subdomain.length < 1) {
      setError("The subdomain name must be at least 1 character.")
      setIsAvailable(null)
      return false
    }

    // Check if subdomain is alphanumeric, lowercase with optional dashes
    const pattern = /^(?!.*--)[a-z0-9-.]+$/
    if (!pattern.test(subdomain)) {
      setError("The subdomain name must be alphanumeric, lowercase, and may contain dashes.")
      setIsAvailable(null)
      return false
    }

    // Check if subdomain contains 'is-a.dev'
    if (subdomain.includes("is-a.dev")) {
      setError("The subdomain name must not contain 'is-a.dev'.")
      setIsAvailable(null)
      return false
    }

    // Check if subdomain contains consecutive dots (for nested subdomains)
    if (subdomain.includes("..")) {
      setError("The subdomain name must not contain consecutive dots.")
      setIsAvailable(null)
      return false
    }

    // Check if subdomain contains consecutive dashes
    if (subdomain.includes("--")) {
      setError("The subdomain name must not contain consecutive dashes.")
      setIsAvailable(null)
      return false
    }

    // Check if subdomain starts with a dot
    if (subdomain.startsWith(".")) {
      setError("The subdomain name must not start with a dot.")
      setIsAvailable(null)
      return false
    }

    // Check if subdomain contains spaces
    if (subdomain.includes(" ")) {
      setError("The subdomain name must not contain spaces.")
      setIsAvailable(null)
      return false
    }

    return true
  }

  const validateAndCheckSubdomain = async (shouldProceed = true) => {
    if (!data.subdomain) {
      setError("Please enter a subdomain")
      setIsAvailable(null)
      return
    }

    // Validate subdomain format
    const isValid = await validateSubdomainFormat(data.subdomain)
    if (!isValid) {
      setIsAvailable(null)
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      // Check if subdomain is available
      const available = await checkSubdomainAvailability(data.subdomain)
      setIsAvailable(available)

      if (available && shouldProceed) {
        setTimeout(() => setCurrentStep("userInfo"), 500)
      }
    } catch (err) {
      setError("Failed to check subdomain availability")
      setIsAvailable(null)
    } finally {
      setIsChecking(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      validateAndCheckSubdomain()
    }
  }

  const updateData = (newData: Partial<SubdomainData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  const goToNextStep = () => {
    switch (currentStep) {
      case "subdomain":
        setCurrentStep("userInfo")
        break
      case "userInfo":
        setCurrentStep("description")
        break
      case "description":
        setCurrentStep("records")
        break
      case "records":
        setCurrentStep("preview")
        break
      default:
        break
    }
  }

  const goToPreviousStep = () => {
    switch (currentStep) {
      case "userInfo":
        setCurrentStep("subdomain")
        break
      case "description":
        setCurrentStep("userInfo")
        break
      case "records":
        setCurrentStep("description")
        break
      case "preview":
        setCurrentStep("records")
        break
      default:
        break
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case "subdomain":
        return (
          <Card className="w-full">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl">Enter your subdomain</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Check if your desired subdomain is available on is-a.dev
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="w-full sm:flex-1 flex items-center">
                  <Input
                    ref={inputRef}
                    value={data.subdomain}
                    onChange={(e) => updateData({ subdomain: e.target.value.toLowerCase() })}
                    onKeyDown={handleKeyDown}
                    placeholder="example"
                    className="flex-1"
                  />
                  <span className="ml-2 text-body-fg">.is-a.dev</span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isAvailable === true && (
                <Alert className="mt-4 bg-success/20 text-body-fg border-success">
                  <Check className="h-4 w-4 text-success" />
                  <AlertDescription>Subdomain is available!</AlertDescription>
                </Alert>
              )}

              {isAvailable === false && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>This subdomain is not available for registration!</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end px-4 sm:px-6 pt-2">
              <Button
                onClick={() => validateAndCheckSubdomain()}
                disabled={isChecking || !data.subdomain || isAvailable === false}
                className="w-full sm:w-auto bg-accent hover:bg-hover-accent text-accent-foreground"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : isAvailable === true ? (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Check Availability
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      case "userInfo":
        return <UserInfoForm data={data} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} />
      case "description":
        return <DescriptionForm data={data} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} />
      case "records":
        return <RecordSelector data={data} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} />
      case "preview":
        return <JsonPreview data={data} onBack={goToPreviousStep} />
      default:
        return null
    }
  }

  return renderStep()
}

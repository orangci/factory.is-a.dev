"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SocialLinks } from "@/components/social-links"

interface UserInfoFormProps {
  data: any
  updateData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function UserInfoForm({ data, updateData, onNext, onBack }: UserInfoFormProps) {
  const [isCheckingGithub, setIsCheckingGithub] = useState(false)
  const [githubError, setGithubError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateGithubUsername = async () => {
    if (!data.username) {
      setGithubError("GitHub username is required")
      return false
    }

    setIsCheckingGithub(true)
    setGithubError(null)

    try {
      // Make a real API call to check if GitHub username exists
      const response = await fetch(`https://api.github.com/users/${data.username}`)

      if (!response.ok) {
        setGithubError("That GitHub username does not exist")
        return false
      }

      // Check if the login key exists in the response
      const userData = await response.json()
      if (!userData.login) {
        setGithubError("That GitHub username does not exist")
        return false
      }

      return true
    } catch (err) {
      setGithubError("Failed to verify GitHub username")
      return false
    } finally {
      setIsCheckingGithub(false)
    }
  }

  const validateEmail = () => {
    setEmailError(null)

    if (!data.email) {
      return true // Email is optional
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      setEmailError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleNext = async () => {
    const isGithubValid = await validateGithubUsername()
    const isEmailValid = validateEmail()

    if (isGithubValid && isEmailValid) {
      onNext()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">User Information</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Provide your GitHub username and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-4 sm:px-6">
        <div className="space-y-2">
          <Label htmlFor="github-username">GitHub Username (required)</Label>
          <Input
            id="github-username"
            value={data.username}
            onChange={(e) => updateData({ username: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="e.g. orangci"
          />
          {githubError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{githubError}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address (optional)</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="you@example.net"
          />
          {emailError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{emailError}</AlertDescription>
            </Alert>
          )}
        </div>

        <SocialLinks platforms={data.platforms} onChange={(platforms) => updateData({ platforms })} />
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between px-4 sm:px-6">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isCheckingGithub}
          className="w-full sm:w-auto bg-accent hover:bg-hover-accent text-accent-foreground"
        >
          {isCheckingGithub ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

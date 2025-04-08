import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function isValidDomain(domain: string): Promise<boolean> {
  const pattern = /^(?!.*--)[a-z0-9-]+$/
  return pattern.test(domain)
}

export async function checkSubdomainAvailability(subdomain: string): Promise<boolean> {
  try {
    // Clean up subdomain if it contains .is-a.dev
    if (subdomain.endsWith(".is-a.dev")) {
      subdomain = subdomain.slice(0, -9)
    }

    // First validate the domain format
    const isValid = await isValidDomain(subdomain)
    if (!isValid) {
      return false
    }

    // Fetch data from the raw.is-a.dev endpoint
    const response = await fetch("https://raw.is-a.dev")
    const data = await response.json()

    // Check if the subdomain exists in the data
    for (const entry of data) {
      if (
        entry.domain?.removeSuffix?.(".is-a.dev") === subdomain ||
        entry.domain === subdomain ||
        entry.domain === `${subdomain}.is-a.dev`
      ) {
        return false // Subdomain is taken
      }
    }

    return true // Subdomain is available
  } catch (error) {
    console.error("Error checking subdomain availability:", error)
    // In case of error, we'll assume the subdomain is not available
    return false
  }
}

// Helper function to mimic Python's removesuffix
String.prototype.removeSuffix = function (suffix: string) {
  if (this.endsWith(suffix)) {
    return this.slice(0, -suffix.length)
  }
  return this.toString()
}

export async function validateGithubUsername(username: string): Promise<boolean> {
  try {
    // Make a real API call to check if GitHub username exists
    const response = await fetch(`https://api.github.com/users/${username}`)
    return response.ok
  } catch (error) {
    console.error("Error validating GitHub username:", error)
    throw error
  }
}

export function validateEmail(email: string): boolean {
  if (!email) return true // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRecordValue(type: string, value: string): string | null {
  if (!value) return null // Empty values will be caught by required field validation

  switch (type) {
    case "CNAME":
      // CNAME should not contain http://, https://, or trailing slashes
      if (value.includes("http://") || value.includes("https://")) {
        return "CNAME should not include http:// or https://"
      }
      if (value.includes("/")) {
        return "CNAME should not include slashes"
      }
      // CNAME must contain at least one period (.) but not at the beginning or end
      if (!value.includes(".")) {
        return "CNAME must contain at least one period (e.g., example.com)"
      }
      if (value.startsWith(".") || value.endsWith(".")) {
        return "CNAME must not start or end with a period"
      }
      return null

    case "A":
      // A record should be a valid IPv4 address
      const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (!ipv4Pattern.test(value)) {
        return "Invalid IPv4 address format"
      }
      return null

    case "AAAA":
      // AAAA record should be a valid IPv6 address
      // This is a simplified check - a full IPv6 validation is more complex
      const ipv6Pattern =
        /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/
      if (!ipv6Pattern.test(value)) {
        return "Invalid IPv6 address format"
      }
      return null

    case "URL":
      // URL should be a valid URL
      try {
        new URL(value)
        return null
      } catch (e) {
        return "Invalid URL format"
      }

    case "MX":
    case "NS":
    case "SRV":
      // These should be valid hostnames
      const hostnamePattern =
        /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/
      if (!hostnamePattern.test(value)) {
        return `Invalid hostname format for ${type} record`
      }
      return null

    default:
      return null
  }
}

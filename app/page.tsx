import { SubdomainChecker } from "@/components/subdomain-checker"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="w-full py-6 border-b border-border bg-header">
        <div className="container flex justify-center">
          <h1 className="text-3xl font-bold text-body-fg">factory.is-a.dev</h1>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <SubdomainChecker />
        </div>
      </main>

      <footer className="w-full py-4 border-t border-border">
        <div className="container flex justify-center">
          <p className="text-body-fg">
            made with 💖 by{" "}
            <a href="https://orangc.net" className="text-orangc hover:underline">
              orangc
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

import { Icons } from "@/components/shared/icons"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MarketingFeatures() {
  return (
    <section className="w-full px-4 py-16 sm:py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
            Why Choose Zero Locker?
          </h2>
          <p className="text-muted-foreground mx-auto max-w-lg text-base sm:max-w-2xl sm:text-lg">
            A complete web-based password management solution with browser
            integration. Manage, organize, and auto-fill your credentials
            seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.globe className="text-primary size-5" />
                <CardTitle>Web-Based Management</CardTitle>
              </div>
              <CardDescription>
                Full management capabilities in your browser. Create, edit, and
                organize your credentials with an intuitive web interface.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.puzzle className="text-primary size-5" />
                <CardTitle>Chrome Extension</CardTitle>
              </div>
              <CardDescription>
                Auto-fill passwords and forms with our Chrome extension.
                Seamless integration with your browsing experience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.shield className="text-primary size-5" />
                <CardTitle>AES-256 Encryption</CardTitle>
              </div>
              <CardDescription>
                Military-grade encryption protects your data. Self-hostable for
                complete control over your sensitive information.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.key className="text-primary size-5" />
                <CardTitle>Credential Management</CardTitle>
              </div>
              <CardDescription>
                Store usernames, passwords, and account details. Organize by
                platforms and containers for easy management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.creditCard className="text-primary size-5" />
                <CardTitle>Payment Card Storage</CardTitle>
              </div>
              <CardDescription>
                Securely store credit cards, bank details, and payment
                information with encrypted protection and easy access.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:border-primary/20 border-2 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icons.lock className="text-primary size-5" />
                <CardTitle>Secret Management</CardTitle>
              </div>
              <CardDescription>
                Store API keys, environment variables, and sensitive
                configuration data with encrypted access control.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  )
}

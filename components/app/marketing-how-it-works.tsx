export function MarketingHowItWorks() {
  return (
    <section className="bg-muted/30 w-full px-4 py-16 sm:py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
            How It Works
          </h2>
          <p className="text-muted-foreground mx-auto max-w-lg text-base sm:max-w-2xl sm:text-lg">
            Manage your credentials in the web app, auto-fill with Chrome
            extension
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
          <div className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-lg font-bold sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
              1
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
              Web Dashboard
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Access your Zero Locker dashboard in any browser. Create, edit,
              and organize your credentials with powerful management tools.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-lg font-bold sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
              2
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
              Chrome Extension
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Install our Chrome extension for seamless auto-fill. Passwords and
              forms are filled automatically when you visit websites.
            </p>
          </div>

          <div className="text-center sm:col-span-2 md:col-span-1">
            <div className="bg-primary text-primary-foreground mx-auto mb-4 flex size-12 items-center justify-center rounded-full text-lg font-bold sm:mb-6 sm:h-16 sm:w-16 sm:text-2xl">
              3
            </div>
            <h3 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
              Secure Sync
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              All your data syncs securely across devices. Self-hosted option
              available for complete control over your credentials.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

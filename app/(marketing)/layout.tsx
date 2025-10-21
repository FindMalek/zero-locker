import { MarketingFooter } from "@/components/app/marketing-footer"
import { MarketingHeaderDesktop } from "@/components/app/marketing-header-desktop"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="absolute inset-0 overflow-hidden bg-black/5">
        <AnimatedGridPattern
          numSquares={45}
          maxOpacity={1}
          duration={3}
          className="text-primary/20"
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <MarketingHeaderDesktop />
        {children}
        <MarketingFooter />
      </div>
    </div>
  )
}

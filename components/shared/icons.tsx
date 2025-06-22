import Image from "next/image"
import { RecentItemType, RecentItemTypeEnum } from "@/schemas/utils"
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpCircleIcon,
  ArrowUpDown,
  AtSignIcon,
  BadgeCheck,
  BarChart,
  Bell,
  BookIcon,
  BookImageIcon,
  BookOpenText,
  Brain,
  Calendar,
  CalendarSearchIcon,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRightIcon,
  ChevronsUpDown,
  Circle,
  Clock,
  CoinsIcon,
  CopyIcon,
  CreditCard,
  DatabaseZapIcon,
  DollarSign,
  EyeIcon,
  File,
  FileText,
  Filter,
  Folder,
  GithubIcon,
  GlobeIcon,
  Grid3X3Icon,
  HelpCircle,
  HomeIcon,
  HospitalIcon,
  Image as ImageIcon,
  Inbox,
  Info,
  KeyIcon,
  Laptop,
  LayoutDashboardIcon,
  LineChartIcon,
  ListIcon,
  Loader2,
  LockIcon,
  LogIn,
  LogOut,
  LogsIcon,
  LucideIcon,
  MailIcon,
  MapPin,
  Menu,
  Monitor,
  Moon,
  MoreHorizontal,
  MoreVertical,
  PencilIcon,
  PhoneIcon,
  Pizza,
  Plus,
  PuzzleIcon,
  RefreshCw,
  SaveIcon,
  Search,
  Settings,
  Shield,
  Sparkles,
  SquareTerminal,
  Stethoscope,
  StretchHorizontalIcon,
  SunMedium,
  ToggleRightIcon,
  Trash,
  TrendingDown,
  TrendingUp,
  UserCircleIcon,
  UserCogIcon,
  UserPlus,
  Users,
  X,
  ZapIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type Icon = LucideIcon

function LogoIcon({ className }: { className?: string }) {
  return <span className={cn(className)}>🔐</span>
}

function LastPassIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logos/lastpass.svg"
      alt="LastPass"
      width={48}
      height={48}
      className={cn(className, "inline-block object-contain align-middle")}
    />
  )
}

function HashiCorpIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/logos/hashicorp.svg"
      alt="HashiCorp"
      width={48}
      height={48}
      className={cn(className, "inline-block object-contain align-middle")}
    />
  )
}

export const Icons = {
  logo: LogoIcon,
  logoLucide: ChevronsRightIcon,
  close: X,
  up: ArrowUp,
  down: ArrowDown,
  right: ChevronRight,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: ImageIcon,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: UserCircleIcon,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  search: Search,
  check: Check,
  orderbook: BookOpenText,
  chevronsUpDown: ChevronsUpDown,
  phone: PhoneIcon,
  mail: MailIcon,
  pencil: PencilIcon,
  student: PencilIcon,
  teacher: UserCogIcon,
  monitor: Monitor,
  lock: LockIcon,
  puzzle: PuzzleIcon,
  globe: GlobeIcon,
  databaseZap: DatabaseZapIcon,
  blog: BookImageIcon,
  graph: LineChartIcon,
  zap: ZapIcon,
  copy: CopyIcon,
  toggleRight: ToggleRightIcon,
  creditCard: CreditCard,
  calendar: Calendar,
  barChart: BarChart,
  clock: Clock,
  brain: Brain,
  menu: Menu,
  document: BookIcon,
  folder: Folder,
  more: MoreHorizontal,
  badgeCheck: BadgeCheck,
  bell: Bell,
  logOut: LogOut,
  sparkles: Sparkles,
  studio: SquareTerminal,
  register: UserPlus,
  appointment: CalendarSearchIcon,
  coins: CoinsIcon,
  location: MapPin,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  dollarSign: DollarSign,
  users: Users,
  inbox: Inbox,
  arrowUpDown: ArrowUpDown,
  circle: Circle,
  helpCircle: HelpCircle,
  shield: Shield,
  therapist: Stethoscope,
  staff: Users,
  pending: Loader2,
  approved: Check,
  rejected: X,
  contacted: MailIcon,
  demoScheduled: CalendarSearchIcon,
  demoCompleted: Check,
  contractSigned: FileText,
  onboarding: UserCogIcon,
  joined: UserPlus,
  save: SaveIcon,
  question: HelpCircle,
  clinic: HospitalIcon,
  edit: PencilIcon,
  userPlus: UserPlus,
  leave: LogOut,
  chevronDown: ChevronDown,
  dashboard: LayoutDashboardIcon,
  lifecycle: ListIcon,
  arrowUpCircle: ArrowUpCircleIcon,
  key: KeyIcon,
  home: HomeIcon,
  account: AtSignIcon,
  info: Info,
  refresh: RefreshCw,
  login: LogIn,
  lastPass: LastPassIcon,
  hashicorp: HashiCorpIcon,
  github: GithubIcon,
  logs: LogsIcon,
  grid: Grid3X3Icon,
  list: ListIcon,
  eye: EyeIcon,
  view: StretchHorizontalIcon,
  filter: Filter,
}

export const getEntityIcon = (itemType: RecentItemType) => {
  switch (itemType) {
    case RecentItemTypeEnum.CREDENTIAL:
      return <AtSignIcon className="h-4 w-4" />
    case RecentItemTypeEnum.CARD:
      return <CreditCard className="h-4 w-4" />
    case RecentItemTypeEnum.SECRET:
      return <KeyIcon className="h-4 w-4" />
  }
}

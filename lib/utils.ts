import {
  ActivityType,
  ActivityTypeEnum,
  RecentItem,
  RecentItemBase,
  RecentItemType,
  RecentItemTypeEnum,
} from "@/schemas/utils"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { User as UserType } from "@/types/dashboard"

import { PRIORITY_ACTIVITY_TYPE } from "@/config/consts"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date)
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function getAvatarOrFallback(user: UserType) {
  if (!user.image) {
    return `https://avatar.vercel.sh/${user.name}`
  }

  return user.image
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function sortByPriority(
  potentialActivities: {
    date: Date
    type: ActivityType
  }[]
) {
  return potentialActivities.sort((a, b) => {
    return PRIORITY_ACTIVITY_TYPE[b.type] - PRIORITY_ACTIVITY_TYPE[a.type]
  })
}

export function getItemName(item: RecentItem): string {
  switch (item.type) {
    case RecentItemTypeEnum.CREDENTIAL:
      return item.entity.username
    case RecentItemTypeEnum.CARD:
      return item.entity.name
    case RecentItemTypeEnum.SECRET:
      return item.entity.name
  }
}

export function mapItem(item: RecentItem): RecentItemBase {
  const createdAtDate = new Date(item.createdAt)
  const updatedAtDate = new Date(item.updatedAt)

  const potentialActivities: {
    date: Date
    type: ActivityType
  }[] = [
    { date: createdAtDate, type: ActivityTypeEnum.CREATED },
    { date: updatedAtDate, type: ActivityTypeEnum.UPDATED },
  ]

  const sortedActivities = sortByPriority(potentialActivities)

  const lastActivity = sortedActivities[0]

  return {
    id: item.id,
    createdAt: createdAtDate,
    updatedAt: updatedAtDate,
    lastActivityAt: lastActivity.date,
    name: getItemName(item),
    activityType: lastActivity.type,
  }
}

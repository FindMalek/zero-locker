import { CredentialEntity } from "@/entities/credential"
import { accountStatusEnum } from "@/schemas/credential/enums"
import {
  invoiceStatusEnum,
  paymentTransactionStatusEnum,
  type InvoiceStatusInfer,
  type PaymentTransactionStatusInfer,
} from "@/schemas/subscription"
import {
  ActivityType,
  ActivityTypeEnum,
  RecentItemType,
  RecentItemTypeEnum,
} from "@/schemas/utils"

import type { RoadmapStatus } from "@/types"

import { Icons } from "@/components/shared/icons"

export function convertActivityTypeToString(
  activityType: ActivityType
): string {
  switch (activityType) {
    case ActivityTypeEnum.CREATED:
      return "Created"
    case ActivityTypeEnum.UPDATED:
      return "Updated"
    case ActivityTypeEnum.COPIED:
      return "Copied"
  }
}

export function convertRecentItemTypeToString(
  recentItemType: RecentItemType
): string {
  switch (recentItemType) {
    case RecentItemTypeEnum.CREDENTIAL:
      return "Credential"
    case RecentItemTypeEnum.CARD:
      return "Card"
    case RecentItemTypeEnum.SECRET:
      return "Secret"
  }
}

export const statusConfig = {
  [accountStatusEnum.ACTIVE]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.ACTIVE
    ),
    icon: Icons.check,
  },
  [accountStatusEnum.SUSPENDED]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.SUSPENDED
    ),
    icon: Icons.warning,
  },
  [accountStatusEnum.DELETED]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.DELETED
    ),
    icon: Icons.trash,
  },
  [accountStatusEnum.ARCHIVED]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.ARCHIVED
    ),
    icon: Icons.archive,
  },
}

export const roadmapStatusConfig: Record<
  RoadmapStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  done: {
    label: "done",
    bgColor: "bg-emerald-500",
    textColor: "text-emerald-500",
  },
  "in-progress": {
    label: "in progress",
    bgColor: "bg-blue-500",
    textColor: "text-blue-500",
  },
  planned: {
    label: "not started",
    bgColor: "bg-gray-600",
    textColor: "text-muted-foreground",
  },
}

/**
 * Get badge variant color for invoice status
 * @param status - The invoice status
 * @returns Badge variant string for UI components
 */
export function getInvoiceStatusColor(
  status: InvoiceStatusInfer
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case invoiceStatusEnum.PAID:
      return "default"
    case invoiceStatusEnum.PENDING:
      return "secondary"
    case invoiceStatusEnum.OVERDUE:
      return "destructive"
    case invoiceStatusEnum.CANCELLED:
      return "outline"
    case invoiceStatusEnum.DRAFT:
      return "outline"
  }
}

/**
 * Get badge variant color for payment transaction status
 * @param status - The payment transaction status
 * @returns Badge variant string for UI components
 */
export function getTransactionStatusColor(
  status: PaymentTransactionStatusInfer
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case paymentTransactionStatusEnum.SUCCESS:
      return "default"
    case paymentTransactionStatusEnum.PENDING:
      return "secondary"
    case paymentTransactionStatusEnum.FAILED:
      return "destructive"
    case paymentTransactionStatusEnum.REFUNDED:
      return "outline"
    case paymentTransactionStatusEnum.PARTIALLY_REFUNDED:
      return "outline"
  }
}

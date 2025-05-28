import {
  CardProviderEnum,
  CardProviderInfer,
  CardSimpleRo,
  CardStatusEnum,
  CardStatusInfer,
  CardTypeEnum,
  CardTypeInfer,
} from "@/schemas/card"
import { CardProvider, CardStatus, CardType } from "@prisma/client"

import { CardEntitySimpleDbData } from "./query"

export class CardEntity {
  static getSimpleRo(entity: CardEntitySimpleDbData): CardSimpleRo {
    return {
      id: entity.id,

      name: entity.name,
      description: entity.description,
      notes: entity.notes,

      type: entity.type,
      status: entity.status,
      provider: entity.provider,

      // TODO: Consider masking or partial display for ROs if sensitive
      number: entity.number,
      expiryDate: entity.expiryDate,
      cvv: entity.cvv,
      encryptionKey: entity.encryptionKey,
      iv: entity.iv,
      billingAddress: entity.billingAddress,
      cardholderName: entity.cardholderName,
      cardholderEmail: entity.cardholderEmail,

      lastCopied: entity.lastCopied,
      lastViewed: entity.lastViewed,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,

      userId: entity.userId,
      containerId: entity.containerId,
    }
  }

  static convertPrismaToCardProvider(
    provider: CardProvider
  ): CardProviderInfer {
    switch (provider) {
      case CardProvider.VISA:
        return CardProviderEnum.VISA
      case CardProvider.MASTERCARD:
        return CardProviderEnum.MASTERCARD
      case CardProvider.AMEX:
        return CardProviderEnum.AMEX
      case CardProvider.DISCOVER:
        return CardProviderEnum.DISCOVER
      case CardProvider.JCB:
        return CardProviderEnum.JCB
      case CardProvider.UNIONPAY:
        return CardProviderEnum.UNIONPAY
      case CardProvider.DINERS_CLUB:
        return CardProviderEnum.DINERS_CLUB
      case CardProvider.OTHER:
        return CardProviderEnum.OTHER
    }
  }

  static convertCardProviderToPrisma(
    provider: CardProviderInfer
  ): CardProvider {
    switch (provider) {
      case CardProviderEnum.VISA:
        return CardProvider.VISA
      case CardProviderEnum.MASTERCARD:
        return CardProvider.MASTERCARD
      case CardProviderEnum.AMEX:
        return CardProvider.AMEX
      case CardProviderEnum.DISCOVER:
        return CardProvider.DISCOVER
      case CardProviderEnum.JCB:
        return CardProvider.JCB
      case CardProviderEnum.UNIONPAY:
        return CardProvider.UNIONPAY
      case CardProviderEnum.DINERS_CLUB:
        return CardProvider.DINERS_CLUB
      case CardProviderEnum.OTHER:
        return CardProvider.OTHER
    }
  }

  static convertCardProviderToString(provider: CardProviderInfer): string {
    switch (provider) {
      case CardProviderEnum.VISA:
        return "VISA"
      case CardProviderEnum.MASTERCARD:
        return "MASTERCARD"
      case CardProviderEnum.AMEX:
        return "AMEX"
      case CardProviderEnum.DISCOVER:
        return "DISCOVER"
      case CardProviderEnum.JCB:
        return "JCB"
      case CardProviderEnum.UNIONPAY:
        return "UNIONPAY"
      case CardProviderEnum.DINERS_CLUB:
        return "DINERS_CLUB"
      case CardProviderEnum.OTHER:
        return "OTHER"
      default:
        return "OTHER"
    }
  }

  static convertPrismaToCardType(type: CardType): CardTypeInfer {
    switch (type) {
      case CardType.CREDIT:
        return CardTypeEnum.CREDIT
      case CardType.DEBIT:
        return CardTypeEnum.DEBIT
      case CardType.VIRTUAL:
        return CardTypeEnum.VIRTUAL
      case CardType.NATIONAL:
        return CardTypeEnum.NATIONAL
      case CardType.PREPAID:
        return CardTypeEnum.PREPAID
    }
  }

  static convertCardTypeToPrisma(type: CardTypeInfer): CardType {
    switch (type) {
      case CardTypeEnum.CREDIT:
        return CardType.CREDIT
      case CardTypeEnum.DEBIT:
        return CardType.DEBIT
      case CardTypeEnum.VIRTUAL:
        return CardType.VIRTUAL
      case CardTypeEnum.NATIONAL:
        return CardType.NATIONAL
      case CardTypeEnum.PREPAID:
        return CardType.PREPAID
    }
  }

  static convertCardTypeToString(type: CardTypeInfer): string {
    switch (type) {
      case CardTypeEnum.CREDIT:
        return "Credit"
      case CardTypeEnum.DEBIT:
        return "Debit"
      case CardTypeEnum.VIRTUAL:
        return "Virtual"
      case CardTypeEnum.NATIONAL:
        return "National"
      case CardTypeEnum.PREPAID:
        return "Prepaid"
      default:
        return "Other"
    }
  }

  static convertPrismaToCardStatus(status: CardStatus): CardStatusInfer {
    switch (status) {
      case CardStatus.ACTIVE:
        return CardStatusEnum.ACTIVE
      case CardStatus.BLOCKED:
        return CardStatusEnum.BLOCKED
      case CardStatus.EXPIRED:
        return CardStatusEnum.EXPIRED
      case CardStatus.INACTIVE:
        return CardStatusEnum.INACTIVE
      case CardStatus.LOST:
        return CardStatusEnum.LOST
    }
  }

  static convertCardStatusToPrisma(status: CardStatusInfer): CardStatus {
    switch (status) {
      case CardStatusEnum.ACTIVE:
        return CardStatus.ACTIVE
      case CardStatusEnum.BLOCKED:
        return CardStatus.BLOCKED
      case CardStatusEnum.EXPIRED:
        return CardStatus.EXPIRED
      case CardStatusEnum.INACTIVE:
        return CardStatus.INACTIVE
      case CardStatusEnum.LOST:
        return CardStatus.LOST
    }
  }

  static convertCardStatusToString(status: CardStatusInfer): string {
    switch (status) {
      case CardStatusEnum.ACTIVE:
        return "Active"
      case CardStatusEnum.BLOCKED:
        return "Blocked"
      case CardStatusEnum.EXPIRED:
        return "Expired"
      case CardStatusEnum.INACTIVE:
        return "Inactive"
      case CardStatusEnum.LOST:
        return "Lost"
      default:
        return "Other"
    }
  }
}

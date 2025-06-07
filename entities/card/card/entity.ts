import {
  cardProviderEnum,
  CardProviderInfer,
  CardSimpleRo,
  cardStatusEnum,
  CardStatusInfer,
  cardTypeEnum,
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

      type: entity.type,
      status: entity.status,
      provider: entity.provider,

      expiryDate: entity.expiryDate,
      billingAddress: entity.billingAddress,
      cardholderName: entity.cardholderName,
      cardholderEmail: entity.cardholderEmail,

      lastViewed: entity.lastViewed,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,

      userId: entity.userId,
      containerId: entity.containerId,

      numberEncryptionId: entity.numberEncryptionId,
      cvvEncryptionId: entity.cvvEncryptionId,
    }
  }

  static convertPrismaToCardProvider(
    provider: CardProvider
  ): CardProviderInfer {
    switch (provider) {
      case CardProvider.VISA:
        return cardProviderEnum.VISA
      case CardProvider.MASTERCARD:
        return cardProviderEnum.MASTERCARD
      case CardProvider.AMEX:
        return cardProviderEnum.AMEX
      case CardProvider.DISCOVER:
        return cardProviderEnum.DISCOVER
      case CardProvider.JCB:
        return cardProviderEnum.JCB
      case CardProvider.UNIONPAY:
        return cardProviderEnum.UNIONPAY
      case CardProvider.DINERS_CLUB:
        return cardProviderEnum.DINERS_CLUB
    }
  }

  static convertCardProviderToPrisma(
    provider: CardProviderInfer
  ): CardProvider {
    switch (provider) {
      case cardProviderEnum.VISA:
        return CardProvider.VISA
      case cardProviderEnum.MASTERCARD:
        return CardProvider.MASTERCARD
      case cardProviderEnum.AMEX:
        return CardProvider.AMEX
      case cardProviderEnum.DISCOVER:
        return CardProvider.DISCOVER
      case cardProviderEnum.JCB:
        return CardProvider.JCB
      case cardProviderEnum.UNIONPAY:
        return CardProvider.UNIONPAY
      case cardProviderEnum.DINERS_CLUB:
        return CardProvider.DINERS_CLUB
    }
  }

  static convertCardProviderToString(provider: CardProviderInfer): string {
    switch (provider) {
      case cardProviderEnum.VISA:
        return "Visa"
      case cardProviderEnum.MASTERCARD:
        return "Mastercard"
      case cardProviderEnum.AMEX:
        return "Amex"
      case cardProviderEnum.DISCOVER:
        return "Discover"
      case cardProviderEnum.JCB:
        return "Jcb"
      case cardProviderEnum.UNIONPAY:
        return "Unionpay"
      case cardProviderEnum.DINERS_CLUB:
        return "Dinersclub"
      default:
        return "OTHER"
    }
  }

  static convertPrismaToCardType(type: CardType): CardTypeInfer {
    switch (type) {
      case CardType.CREDIT:
        return cardTypeEnum.CREDIT
      case CardType.DEBIT:
        return cardTypeEnum.DEBIT
      case CardType.VIRTUAL:
        return cardTypeEnum.VIRTUAL
      case CardType.NATIONAL:
        return cardTypeEnum.NATIONAL
      case CardType.PREPAID:
        return cardTypeEnum.PREPAID
    }
  }

  static convertCardTypeToPrisma(type: CardTypeInfer): CardType {
    switch (type) {
      case cardTypeEnum.CREDIT:
        return CardType.CREDIT
      case cardTypeEnum.DEBIT:
        return CardType.DEBIT
      case cardTypeEnum.VIRTUAL:
        return CardType.VIRTUAL
      case cardTypeEnum.NATIONAL:
        return CardType.NATIONAL
      case cardTypeEnum.PREPAID:
        return CardType.PREPAID
    }
  }

  static convertCardTypeToString(type: CardTypeInfer): string {
    switch (type) {
      case cardTypeEnum.CREDIT:
        return "Credit"
      case cardTypeEnum.DEBIT:
        return "Debit"
      case cardTypeEnum.VIRTUAL:
        return "Virtual"
      case cardTypeEnum.NATIONAL:
        return "National"
      case cardTypeEnum.PREPAID:
        return "Prepaid"
      default:
        return "Other"
    }
  }

  static convertPrismaToCardStatus(status: CardStatus): CardStatusInfer {
    switch (status) {
      case CardStatus.ACTIVE:
        return cardStatusEnum.ACTIVE
      case CardStatus.BLOCKED:
        return cardStatusEnum.BLOCKED
      case CardStatus.EXPIRED:
        return cardStatusEnum.EXPIRED
      case CardStatus.INACTIVE:
        return cardStatusEnum.INACTIVE
      case CardStatus.LOST:
        return cardStatusEnum.LOST
      default:
        return cardStatusEnum.ACTIVE
    }
  }

  static convertCardStatusToPrisma(status: CardStatusInfer): CardStatus {
    switch (status) {
      case cardStatusEnum.ACTIVE:
        return CardStatus.ACTIVE
      case cardStatusEnum.BLOCKED:
        return CardStatus.BLOCKED
      case cardStatusEnum.EXPIRED:
        return CardStatus.EXPIRED
      case cardStatusEnum.INACTIVE:
        return CardStatus.INACTIVE
      case cardStatusEnum.LOST:
        return CardStatus.LOST
    }
  }

  static convertCardStatusToString(status: CardStatusInfer): string {
    switch (status) {
      case cardStatusEnum.ACTIVE:
        return "Active"
      case cardStatusEnum.BLOCKED:
        return "Blocked"
      case cardStatusEnum.EXPIRED:
        return "Expired"
      case cardStatusEnum.INACTIVE:
        return "Inactive"
      case cardStatusEnum.LOST:
        return "Lost"
      default:
        return "Other"
    }
  }
}

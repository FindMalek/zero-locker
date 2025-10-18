import {
  CredentialKeyValuePairDbData,
  CredentialKeyValuePairSimpleDbData,
} from "@/entities/credential/credential-key-value/query"
import { EncryptedDataEntity } from "@/entities/encryption"
import {
  type CredentialKeyValuePairDto,
  type CredentialKeyValuePairSimpleRo,
  type CredentialKeyValuePairWithEncryptionRo,
} from "@/schemas/credential/credential-key-value"
import { type GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"
import { type BaseKeyValuePair } from "@/schemas/utils"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"

export class CredentialKeyValuePairEntity {
  static getSimpleRo(
    credentialKeyValuePair: CredentialKeyValuePairSimpleDbData
  ): CredentialKeyValuePairSimpleRo {
    return {
      id: credentialKeyValuePair.id,
      key: credentialKeyValuePair.key,
      valueEncryptionId: credentialKeyValuePair.valueEncryptionId,
      credentialMetadataId: credentialKeyValuePair.credentialMetadataId,
      createdAt: credentialKeyValuePair.createdAt,
      updatedAt: credentialKeyValuePair.updatedAt,
    }
  }

  static getWithEncryptionRo(
    credentialKeyValuePair: CredentialKeyValuePairDbData
  ): CredentialKeyValuePairWithEncryptionRo {
    return {
      id: credentialKeyValuePair.id,
      key: credentialKeyValuePair.key,
      valueEncryption: EncryptedDataEntity.getSimpleRo(
        credentialKeyValuePair.valueEncryption
      ),
      credentialMetadataId: credentialKeyValuePair.credentialMetadataId,
      createdAt: credentialKeyValuePair.createdAt,
      updatedAt: credentialKeyValuePair.updatedAt,
    }
  }

  static convertGenericToCredential(
    generic: GenericEncryptedKeyValuePairDto
  ): CredentialKeyValuePairDto {
    return {
      id: generic.id,
      key: generic.key,
      valueEncryption: generic.valueEncryption,
      credentialMetadataId: undefined,
    }
  }

  static convertCredentialToGeneric(
    credential: CredentialKeyValuePairDto
  ): GenericEncryptedKeyValuePairDto {
    return {
      id: credential.id,
      key: credential.key,
      valueEncryption: credential.valueEncryption,
    }
  }

  static convertForKeyValueManager(credential: CredentialKeyValuePairDto): {
    id: string
    key: string
    value: string
  } {
    return {
      id: credential.id || "",
      key: credential.key,
      value: "",
    }
  }

  static convertFromKeyValueManager(
    pair: BaseKeyValuePair
  ): CredentialKeyValuePairDto {
    return {
      id: pair.id,
      key: pair.key,
      valueEncryption: {
        encryptedValue: "",
        iv: "",
        encryptionKey: "",
      },
      credentialMetadataId: undefined,
    }
  }

  static async encryptKeyValuePair(
    pair: BaseKeyValuePair
  ): Promise<GenericEncryptedKeyValuePairDto> {
    if (!pair.key.trim() || !pair.value.trim()) {
      throw new Error("Both key and value are required for encryption")
    }

    const key = await generateEncryptionKey()
    const encryptResult = await encryptData(pair.value, key)
    const keyString = await exportKey(key as CryptoKey)

    return {
      id: pair.id,
      key: pair.key,
      valueEncryption: {
        encryptedValue: encryptResult.encryptedData,
        iv: encryptResult.iv,
        encryptionKey: keyString,
      },
    }
  }

  static async encryptKeyValuePairs(
    pairs: BaseKeyValuePair[]
  ): Promise<GenericEncryptedKeyValuePairDto[]> {
    const validPairs = pairs.filter(
      (pair) => pair.key.trim() && pair.value.trim()
    )

    if (validPairs.length === 0) {
      return []
    }

    const encryptedPairs: GenericEncryptedKeyValuePairDto[] = []

    for (const pair of validPairs) {
      const encryptedPair = await this.encryptKeyValuePair(pair)
      encryptedPairs.push(encryptedPair)
    }

    return encryptedPairs
  }
}

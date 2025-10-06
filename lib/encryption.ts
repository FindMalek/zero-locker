// Check if we're in Node.js or browser environment
const isNode = typeof window === "undefined"

// Secure ID generation utility for key-value pairs
export function generateSecureId(prefix: string = "kv"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  // Fallback for environments without crypto.randomUUID
  return `${prefix}_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`
}

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey | string> {
  if (isNode) {
    const crypto = await import("crypto")
    return crypto.randomBytes(32).toString("base64")
  }

  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

// Convert ArrayBuffer to string (browser only)
function arrayBufferToString(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

// Encrypt data - works in both Node.js and browser
export async function encryptData(
  data: string,
  key: CryptoKey | string,
  iv?: string
): Promise<{
  encryptedData: string
  iv: string
}> {
  if (isNode) {
    // Node.js encryption - use AES-GCM to match browser behavior
    const crypto = await import("crypto")
    const keyString = typeof key === "string" ? key : ""
    const ivString = iv || crypto.randomBytes(12).toString("base64") // 12 bytes for AES-GCM

    const keyBuffer = Buffer.from(keyString, "base64")
    const ivBuffer = Buffer.from(ivString, "base64")

    const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer)

    const encryptedBuffer = cipher.update(data, "utf8")
    const finalBuffer = cipher.final()

    // Get the auth tag for GCM
    const authTag = cipher.getAuthTag()

    // Concatenate ciphertext and auth tag as raw bytes, then base64 encode
    const combinedBuffer = Buffer.concat([
      encryptedBuffer,
      finalBuffer,
      authTag,
    ])
    const encrypted = combinedBuffer.toString("base64")

    return {
      encryptedData: encrypted,
      iv: ivString,
    }
  }

  // Browser encryption
  const cryptoKey = key as CryptoKey

  // Use provided IV or generate a random initialization vector
  let ivArray: Uint8Array
  if (iv) {
    // Convert provided IV from base64 to Uint8Array
    const decoded = atob(iv)
    ivArray = new Uint8Array(decoded.length)
    for (let i = 0; i < decoded.length; i++) {
      ivArray[i] = decoded.charCodeAt(i)
    }
  } else {
    // Generate a random initialization vector
    ivArray = new Uint8Array(12)
    window.crypto.getRandomValues(ivArray)
    // Create a new Uint8Array to ensure proper ArrayBuffer backing
    ivArray = new Uint8Array(ivArray)
  }

  // Convert data to ArrayBuffer
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data).buffer as ArrayBuffer

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: ivArray as BufferSource,
    },
    cryptoKey,
    dataBuffer as BufferSource
  )

  // Convert encrypted data and IV to base64 strings
  const encryptedData = btoa(
    String.fromCharCode(...Array.from(new Uint8Array(encryptedBuffer)))
  )
  const ivString = btoa(String.fromCharCode(...Array.from(ivArray)))

  return {
    encryptedData,
    iv: ivString,
  }
}

// Decrypt data - works in both Node.js and browser, handles both AES-GCM and AES-CBC
export async function decryptData(
  encryptedData: string,
  iv: string,
  key: CryptoKey | string
): Promise<string> {
  if (isNode) {
    // Node.js decryption
    const crypto = await import("crypto")
    const keyString = typeof key === "string" ? key : ""

    const keyBuffer = Buffer.from(keyString, "base64")
    const ivBuffer = Buffer.from(iv, "base64")

    // Detect encryption algorithm based on IV length
    const isGCM = ivBuffer.length === 12 // AES-GCM uses 12-byte IV
    const isCBC = ivBuffer.length === 16 // AES-CBC uses 16-byte IV
    const isLegacy = ivBuffer.length === 32 // Legacy encryption method

    if (isGCM) {
      // Handle AES-GCM decryption (data from browser)
      // Browser's Web Crypto API includes auth tag in the encrypted data automatically
      const encryptedBuffer = Buffer.from(encryptedData, "base64")

      // For browser-generated data, the auth tag is included in the encrypted buffer
      // Extract the last 16 bytes as auth tag
      const authTagLength = 16
      const ciphertext = encryptedBuffer.subarray(0, -authTagLength)
      const authTag = encryptedBuffer.subarray(-authTagLength)

      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        keyBuffer,
        ivBuffer
      )
      decipher.setAuthTag(authTag)

      const decryptedUpdate = decipher.update(ciphertext)
      const decryptedFinal = decipher.final()
      const decryptedBuffer = Buffer.concat([decryptedUpdate, decryptedFinal])

      return decryptedBuffer.toString("utf8")
    } else if (isCBC) {
      // Handle AES-CBC decryption (legacy seeded data)
      // First try AES-CBC, but if it fails, try AES-GCM as fallback
      try {
        const decipher = crypto.createDecipheriv(
          "aes-256-cbc",
          keyBuffer,
          ivBuffer
        )

        let decrypted = decipher.update(encryptedData, "base64", "utf8")
        decrypted += decipher.final("utf8")

        return decrypted
      } catch (cbcError) {
        // If AES-CBC fails, try AES-GCM as fallback
        // This handles cases where data was encrypted with AES-GCM but IV is 16 bytes
        try {
          const encryptedBuffer = Buffer.from(encryptedData, "base64")

          // For AES-GCM, extract auth tag from the end
          const authTagLength = 16
          const ciphertext = encryptedBuffer.subarray(0, -authTagLength)
          const authTag = encryptedBuffer.subarray(-authTagLength)

          const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            keyBuffer,
            ivBuffer.subarray(0, 12) // Use first 12 bytes for GCM
          )
          decipher.setAuthTag(authTag)

          const decryptedUpdate = decipher.update(ciphertext)
          const decryptedFinal = decipher.final()
          const decryptedBuffer = Buffer.concat([
            decryptedUpdate,
            decryptedFinal,
          ])

          return decryptedBuffer.toString("utf8")
        } catch (gcmError) {
          // If both fail, throw the original CBC error with more context
          console.error("AES-GCM fallback also failed:", gcmError)
          throw cbcError
        }
      }
    } else if (isLegacy) {
      // Handle legacy 32-byte IV with multiple fallback methods
      const keyToUse = await getLegacyKey(keyBuffer)
      const truncatedIv = ivBuffer.subarray(0, 16)

      // Try multiple decryption methods in order of likelihood
      return tryLegacyDecryption(
        encryptedData,
        keyToUse,
        keyBuffer,
        ivBuffer,
        truncatedIv
      )
    } else {
      throw new Error(
        `Unsupported IV length: ${ivBuffer.length} bytes. Expected 12 bytes (AES-GCM) or 16 bytes (AES-CBC).`
      )
    }
  }

  // Browser decryption
  const cryptoKey = key as CryptoKey

  // Convert base64 strings back to ArrayBuffers
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  )
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0))

  // Decrypt the data
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    cryptoKey,
    encryptedBuffer
  )

  // Convert decrypted data back to string
  return arrayBufferToString(decryptedBuffer)
}

// Export key to string (browser only)
export async function exportKey(key: CryptoKey): Promise<string> {
  if (isNode) {
    throw new Error("exportKey is only available in browser environments")
  }

  const exported = await window.crypto.subtle.exportKey("raw", key)
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(exported))))
}

// Import key from string (browser only)
export async function importKey(keyString: string): Promise<CryptoKey> {
  if (isNode) {
    throw new Error("importKey is only available in browser environments")
  }

  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0))
  return await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  )
}

// Generate consistent encryption keys for seeding (Node.js only)
export const SEED_ENCRYPTION_CONFIG = {
  // Main encryption key for all sensitive data (32 bytes base64 encoded)
  MASTER_KEY: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", // 32 bytes of zeros, base64 encoded

  // Different IVs for different data types to ensure uniqueness (16 bytes base64 encoded)
  CARD_NUMBER_IV: "AAAAAAAAAAAAAAAAAAAAAA==", // 16 bytes of zeros, base64 encoded
  CARD_CVV_IV: "AQEBAQEBAQEBAQEBAQEBAQ==", // 16 bytes of 0x01, base64 encoded
  CREDENTIAL_PASSWORD_IV: "AgICAgICAgICAgICAgICAg==", // 16 bytes of 0x02, base64 encoded
  SECRET_VALUE_IV: "AwMDAwMDAwMDAwMDAwMDAw==", // 16 bytes of 0x03, base64 encoded
}

// Simple encryption function for seeding (Node.js only)
export async function encryptDataSync(
  plaintext: string,
  key: string,
  iv: string
): Promise<string> {
  if (!isNode) {
    throw new Error("encryptDataSync is only available in Node.js environments")
  }

  const crypto = await import("crypto")
  const keyBuffer = Buffer.from(key, "base64")
  const ivBuffer = Buffer.from(iv, "base64")

  // Detect encryption algorithm based on IV length
  const isGCM = ivBuffer.length === 12 // AES-GCM uses 12-byte IV
  const isCBC = ivBuffer.length === 16 // AES-CBC uses 16-byte IV

  if (isGCM) {
    // Use AES-GCM for consistency with browser
    const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer)

    const encryptedBuffer = cipher.update(plaintext, "utf8")
    const finalBuffer = cipher.final()

    // Get the auth tag for GCM
    const authTag = cipher.getAuthTag()

    // Concatenate ciphertext and auth tag as raw bytes, then base64 encode
    const combinedBuffer = Buffer.concat([
      encryptedBuffer,
      finalBuffer,
      authTag,
    ])
    const encrypted = combinedBuffer.toString("base64")

    return encrypted
  } else if (isCBC) {
    // Legacy AES-CBC for backward compatibility
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, ivBuffer)

    let encrypted = cipher.update(plaintext, "utf8", "base64")
    encrypted += cipher.final("base64")

    return encrypted
  } else {
    throw new Error(
      `Unsupported IV length: ${ivBuffer.length} bytes. Expected 12 bytes (AES-GCM) or 16 bytes (AES-CBC).`
    )
  }
}

// Helper function to get appropriate key for legacy decryption
async function getLegacyKey(keyBuffer: Buffer): Promise<Buffer> {
  if (keyBuffer.length === 32) {
    return keyBuffer
  } else if (keyBuffer.length === 16) {
    return Buffer.concat([keyBuffer, keyBuffer])
  } else {
    // Derive a 32-byte key using SHA-256
    const crypto = await import("crypto")
    const hash = crypto.createHash("sha256")
    hash.update(keyBuffer)
    return Buffer.from(hash.digest())
  }
}

// Helper function to try multiple decryption methods for legacy data
async function tryLegacyDecryption(
  encryptedData: string,
  keyToUse: Buffer,
  originalKeyBuffer: Buffer,
  ivBuffer: Buffer,
  truncatedIv: Buffer
): Promise<string> {
  const crypto = await import("crypto")

  // Try AES-GCM with full IV
  try {
    const encryptedBuffer = Buffer.from(encryptedData, "base64")
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyToUse, ivBuffer)

    const authTagLength = 16
    const ciphertext = encryptedBuffer.subarray(0, -authTagLength)
    const authTag = encryptedBuffer.subarray(-authTagLength)

    decipher.setAuthTag(authTag)

    const decryptedUpdate = decipher.update(ciphertext)
    const decryptedFinal = decipher.final()
    const decryptedBuffer = Buffer.concat([decryptedUpdate, decryptedFinal])

    return decryptedBuffer.toString("utf8")
  } catch {
    // Try AES-256-CBC with truncated IV
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        keyToUse,
        truncatedIv
      )
      let decrypted = decipher.update(encryptedData, "base64", "utf8")
      decrypted += decipher.final("utf8")
      return decrypted
    } catch {
      // Try AES-128-CBC with 16-byte key
      try {
        const key128 =
          originalKeyBuffer.length >= 16
            ? originalKeyBuffer.subarray(0, 16)
            : originalKeyBuffer
        const decipher128 = crypto.createDecipheriv(
          "aes-128-cbc",
          key128,
          truncatedIv
        )

        let decrypted128 = decipher128.update(encryptedData, "base64", "utf8")
        decrypted128 += decipher128.final("utf8")
        return decrypted128
      } catch {
        // Last resort: try base64 decode as plain text
        try {
          return Buffer.from(encryptedData, "base64").toString("utf8")
        } catch {
          throw new Error(
            "Unable to decrypt legacy data with any supported method"
          )
        }
      }
    }
  }
}

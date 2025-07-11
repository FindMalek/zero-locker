// Check if we're in Node.js or browser environment
const isNode = typeof window === "undefined"

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

// Convert string to ArrayBuffer (browser only)
function stringToArrayBuffer(str: string): Uint8Array {
  const encoder = new TextEncoder()
  return encoder.encode(str)
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
    // Node.js encryption
    const crypto = await import("crypto")
    const keyString = typeof key === "string" ? key : ""
    const ivString = iv || crypto.randomBytes(16).toString("base64")

    const keyBuffer = Buffer.from(keyString, "base64")
    const ivBuffer = Buffer.from(ivString, "base64")

    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, ivBuffer)

    let encrypted = cipher.update(data, "utf8", "base64")
    encrypted += cipher.final("base64")

    return {
      encryptedData: encrypted,
      iv: ivString,
    }
  }

  // Browser encryption
  const cryptoKey = key as CryptoKey

  // Generate a random initialization vector
  const ivArray = window.crypto.getRandomValues(new Uint8Array(12))

  // Convert data to ArrayBuffer
  const dataBuffer = stringToArrayBuffer(data)

  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: ivArray,
    },
    cryptoKey,
    dataBuffer
  )

  // Convert encrypted data and IV to base64 strings
  const encryptedData = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  )
  const ivString = btoa(String.fromCharCode(...ivArray))

  return {
    encryptedData,
    iv: ivString,
  }
}

// Decrypt data - works in both Node.js and browser
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

    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer)

    let decrypted = decipher.update(encryptedData, "base64", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
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
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
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

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, ivBuffer)

  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")

  return encrypted
}

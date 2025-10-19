/**
 * Schema exports
 * 
 * Each schema module is exported as a namespace to avoid naming conflicts.
 * Import specific schemas from their modules, or use namespace imports.
 * 
 * Example:
 *   import { credential } from "@/schemas"
 *   import { CredentialOutput } from "@/schemas/credential"
 */

export * as credential from "./credential"
export * as card from "./card"
export * as utils from "./utils"
export * as secret from "./secrets"
export * as encryption from "./encryption"
export * as user from "./user"

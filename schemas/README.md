# Schemas Folder - Architecture Documentation

## Overview

The `/schemas` folder contains Zod validation schemas organized in a **clear, consistent three-file pattern** that separates concerns between inputs, outputs, and enums.

## New Architecture (Post-Refactor)

### File Structure Pattern

Each entity follows this consistent structure:

```
schemas/
├── {entity}/
│   ├── {entity}.input.ts     # All input DTOs (create, update, delete, get, list)
│   ├── {entity}.output.ts    # All output ROs (simple, include, list response)
│   ├── {entity}.enums.ts     # Enum schemas (optional, only if entity has enums)
│   └── index.ts              # Barrel exports
```

### File Responsibilities

#### `{entity}.input.ts`

- **Purpose**: Input validation schemas for all operations
- **Contains**:
  - Base input schema (e.g., `credentialInputSchema`)
  - CRUD operation inputs (create, get, update, delete)
  - List operation inputs (pagination, filters, sorting)
  - Form-specific input schemas
  - Backward compatibility aliases (deprecated)

#### `{entity}.output.ts`

- **Purpose**: Return Object (RO) schemas for API responses
- **Contains**:
  - Simple output schema (e.g., `credentialSimpleOutputSchema`)
  - Include output schema (with relations)
  - List response output schema
  - Backward compatibility aliases (deprecated)

#### `{entity}.enums.ts` (Optional)

- **Purpose**: Enum definitions and utilities
- **Contains**:
  - Zod enum schemas
  - Enum type definitions
  - List of enum values
  - Type inference helpers

#### `index.ts`

- **Purpose**: Barrel exports for clean imports
- **Contains**: Re-exports all schemas from the entity folder

## Example Structure

### Credential Entity

```typescript
// credential.input.ts
export const credentialInputSchema = z.object({ ... })
export const createCredentialInputSchema = credentialInputSchema
export const updateCredentialInputSchema = credentialInputSchema.partial().extend({ ... })
export const getCredentialInputSchema = z.object({ id: z.string() })
export const listCredentialsInputSchema = z.object({ page, limit, filters, sort })

// credential.output.ts
export const credentialSimpleOutputSchema = z.object({ ... })
export const credentialIncludeOutputSchema = credentialSimpleOutputSchema.extend({ ... })
export const listCredentialsOutputSchema = z.object({ credentials, total, hasMore })

// credential.enums.ts
export const accountStatusSchema = z.enum([...])
export const LIST_ACCOUNT_STATUSES = Object.values(accountStatusEnum)
```

## Naming Conventions

### Schemas

- **Input schemas**: `{entity}InputSchema`, `create{Entity}InputSchema`, `update{Entity}InputSchema`
- **Output schemas**: `{entity}SimpleOutputSchema`, `{entity}IncludeOutputSchema`, `list{Entities}OutputSchema`
- **Enum schemas**: `{property}Schema`, `LIST_{PROPERTY}S`

### Types

- **Input types**: `{Entity}Input`, `Create{Entity}Input`, `Update{Entity}Input`
- **Output types**: `{Entity}SimpleOutput`, `{Entity}IncludeOutput`, `List{Entities}Output`
- **Enum types**: `{Property}Infer`

## Import Examples

### Using Barrel Exports (Recommended)

```typescript
import {
  accountStatusSchema,
  createCredentialInputSchema,
  credentialSimpleOutputSchema,
} from "@/schemas/credential"
```

### Direct Imports (If Needed)

```typescript
import { accountStatusSchema } from "@/schemas/credential/credential.enums"
import { createCredentialInputSchema } from "@/schemas/credential/credential.input"
import { credentialSimpleOutputSchema } from "@/schemas/credential/credential.output"
```

## Backward Compatibility

To ensure a smooth transition, **deprecated aliases** are provided in the new files:

```typescript
// Deprecated - will be removed in future
/** @deprecated Use credentialInputSchema instead */
export const credentialDtoSchema = credentialInputSchema

/** @deprecated Use credentialSimpleOutputSchema instead */
export const credentialSimpleRoSchema = credentialSimpleOutputSchema
```

### Migration Guide

When updating code, replace deprecated names:

| Old Name (Deprecated)       | New Name                        |
| --------------------------- | ------------------------------- |
| `credentialDtoSchema`       | `credentialInputSchema`         |
| `credentialSimpleRoSchema`  | `credentialSimpleOutputSchema`  |
| `credentialIncludeRoSchema` | `credentialIncludeOutputSchema` |
| `CredentialDto`             | `CredentialInput`               |
| `CredentialSimpleRo`        | `CredentialSimpleOutput`        |

## Benefits of New Architecture

### 1. **Clear Separation of Concerns**

- Input schemas are completely separate from output schemas
- Easy to find what you need (input vs output)
- No confusion about what goes in vs what comes out

### 2. **Consistent Organization**

- Every entity follows the same pattern
- Predictable file structure across all entities
- Easy to navigate and understand

### 3. **Better Discoverability**

- File names clearly indicate their purpose
- IDE autocomplete works better
- Easier to onboard new developers

### 4. **Scalability**

- Easy to add new entities following the same pattern
- Schema files stay focused and manageable
- No more mixing concerns in a single file

### 5. **Type Safety**

- Full TypeScript coverage
- Type inference from Zod schemas
- Compile-time validation

## Refactored Entities

The following entities have been refactored to the new architecture:

- ✅ **credential** - credential.input.ts, credential.output.ts, credential.enums.ts
- ✅ **card** - card.input.ts, card.output.ts, card.enums.ts
- ✅ **secret** - secret.input.ts, secret.output.ts
- ✅ **container** - container.input.ts, container.output.ts, container.enums.ts
- ✅ **platform** - platform.input.ts, platform.output.ts, platform.enums.ts
- ✅ **tag** - tag.input.ts, tag.output.ts

## Old vs New Comparison

### Old Structure (Before Refactor)

```
credential/
├── credential.ts       # Mixed DTOs and ROs 😞
├── dto.ts             # Redundant re-exports 😞
├── credential-metadata.ts
└── index.ts
```

**Problems:**

- DTOs and ROs mixed in the same file
- Redundant `dto.ts` files that just re-export
- Hard to find what you need
- Inconsistent across entities

### New Structure (After Refactor)

```
credential/
├── credential.input.ts    # All inputs ✅
├── credential.output.ts   # All outputs ✅
├── credential.enums.ts    # All enums ✅
├── credential-metadata.ts # Related schema
└── index.ts              # Barrel exports
```

**Benefits:**

- Clear separation between inputs and outputs
- No redundant files
- Easy to find what you need
- Consistent across all entities

## Best Practices

### 1. **Always Use Barrel Exports**

```typescript
// ✅ Good
import { createCredentialInputSchema } from "@/schemas/credential"

// ❌ Avoid
import { createCredentialInputSchema } from "@/schemas/credential/credential.input"
```

### 2. **Use Descriptive Schema Names**

```typescript
// ✅ Good
export const createCredentialInputSchema = credentialInputSchema
export const credentialSimpleOutputSchema = z.object({ ... })

// ❌ Avoid
export const credentialSchema = z.object({ ... })
export const credentialRo = z.object({ ... })
```

### 3. **Group Related Schemas**

```typescript
// ✅ Good - Group by operation type
// CRUD Operation Input Schemas
export const createCredentialInputSchema = ...
export const getCredentialInputSchema = ...
export const updateCredentialInputSchema = ...
export const deleteCredentialInputSchema = ...
```

### 4. **Add JSDoc Comments for Deprecated Schemas**

```typescript
// ✅ Good
/** @deprecated Use credentialInputSchema instead */
export const credentialDtoSchema = credentialInputSchema
```

### 5. **Export Both Schemas and Types**

```typescript
// ✅ Good
export const credentialInputSchema = z.object({ ... })
export type CredentialInput = z.infer<typeof credentialInputSchema>
```

## Testing

When testing schemas:

1. **Test valid data passes validation**
2. **Test invalid data fails validation**
3. **Test edge cases and boundary conditions**
4. **Test custom validation functions**
5. **Test error messages are user-friendly**

## Contributing

When adding a new entity:

1. Create the three files: `{entity}.input.ts`, `{entity}.output.ts`, `{entity}.enums.ts` (if needed)
2. Follow the naming conventions
3. Add comprehensive JSDoc comments
4. Export from `index.ts`
5. Update this README with the new entity

## Questions?

If you have questions about the schema architecture, please refer to:

- [Zero Locker Patterns](../PATTERNS.md)
- [Zero Locker Coding Rules](../CODING_RULES.md)

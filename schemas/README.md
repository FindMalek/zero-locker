# Schemas Folder - Architecture Documentation

## Overview

The `/schemas` folder contains Zod validation schemas organized in a **clean, hierarchical folder structure** with **unprefixed file names** (input.ts, output.ts, enums.ts) for maximum clarity.

## New Architecture (Post-Refactor v2)

### File Structure Pattern

Each entity follows this consistent structure:

```
schemas/
├── {entity}/
│   ├── input.ts          # All input schemas (no entity prefix!)
│   ├── output.ts         # All output schemas (no entity prefix!)
│   ├── enums.ts          # Enum schemas (optional)
│   ├── {sub-entity}/     # Sub-entities get their own folders
│   │   ├── input.ts
│   │   ├── output.ts
│   │   └── index.ts
│   └── index.ts          # Barrel exports
```

### Key Principles

1. **No Entity Prefix in Filenames**: Files are named `input.ts`, `output.ts`, `enums.ts` (NOT `credential.input.ts`)
2. **No Entity Prefix in Schema Names**: Schemas are named `inputSchema`, `outputSchema` (NOT `credentialInputSchema`)
3. **Hierarchical Folders**: Sub-entities get their own folders with the same pattern
4. **Barrel Exports**: Every folder has an `index.ts` for clean imports

## Example: Credential Entity

### Folder Structure

```
credential/
├── input.ts              # Main credential input schemas
├── output.ts             # Main credential output schemas
├── enums.ts              # Credential enums (AccountStatus)
├── history/              # Credential history sub-entity
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
├── key-value/            # Credential key-value sub-entity
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
├── metadata/             # Credential metadata sub-entity
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
├── with-metadata/        # Composite operations
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
└── index.ts              # Exports everything
```

### Schema Naming (credential/input.ts)

```typescript
// ✅ NEW - Clean, unprefixed names
export const inputSchema = z.object({ ... })
export const createInputSchema = inputSchema
export const updateInputSchema = inputSchema.partial().extend({ ... })
export const listInputSchema = z.object({ ... })

export type Input = z.infer<typeof inputSchema>
export type CreateInput = z.infer<typeof createInputSchema>

// ❌ OLD - Entity-prefixed names (deprecated but supported for backward compatibility)
/** @deprecated Use inputSchema instead */
export const credentialInputSchema = inputSchema
```

### Sub-Entity Naming (credential/history/input.ts)

```typescript
// ✅ NEW - Simple names within the history context
export const historyInputSchema = z.object({ ... })
export type HistoryInput = z.infer<typeof historyInputSchema>

// Backward compatibility
/** @deprecated Use historyInputSchema instead */
export const credentialHistoryDtoSchema = historyInputSchema
```

## Example: Utils Folder

### Folder Structure

```
utils/
├── container/
│   ├── input.ts
│   ├── output.ts
│   ├── enums.ts
│   ├── with-secrets/     # Container with secrets sub-entity
│   │   ├── input.ts
│   │   ├── output.ts
│   │   └── index.ts
│   └── index.ts
├── platform/
│   ├── input.ts
│   ├── output.ts
│   ├── enums.ts
│   └── index.ts
├── tag/
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
├── base-key-value-pair.ts  # Utility schemas
├── breadcrumb.ts
├── utils.ts
└── index.ts
```

## File Responsibilities

### `input.ts`
- **Purpose**: Input validation schemas for all operations
- **Contains**:
  - Base input schema (e.g., `inputSchema`)
  - CRUD operation inputs (`createInputSchema`, `getInputSchema`, `updateInputSchema`, `deleteInputSchema`)
  - List operation inputs (`listInputSchema`)
  - Form-specific input schemas (`formInputSchema`)
  - Backward compatibility aliases (deprecated)

### `output.ts`
- **Purpose**: Return Object (RO) schemas for API responses
- **Contains**:
  - Simple output schema (`simpleOutputSchema`)
  - Include output schema with relations (`includeOutputSchema`)
  - List response output schema (`listOutputSchema`)
  - Backward compatibility aliases (deprecated)

### `enums.ts` (Optional)
- **Purpose**: Enum definitions and utilities
- **Contains**:
  - Zod enum schemas
  - Enum type definitions
  - List of enum values
  - Type inference helpers

### `index.ts`
- **Purpose**: Barrel exports for clean imports
- **Contains**: Re-exports all schemas from the folder and subfolders

## Naming Conventions

### Schema Names (NO entity prefix!)
- **Input schemas**: `inputSchema`, `createInputSchema`, `updateInputSchema`, `listInputSchema`
- **Output schemas**: `simpleOutputSchema`, `includeOutputSchema`, `listOutputSchema`
- **Enum schemas**: `{property}Schema` (e.g., `accountStatusSchema`)

### Type Names (NO entity prefix!)
- **Input types**: `Input`, `CreateInput`, `UpdateInput`, `ListInput`
- **Output types**: `SimpleOutput`, `IncludeOutput`, `ListOutput`
- **Enum types**: `{Property}Infer` (e.g., `AccountStatusInfer`)

### Sub-Entity Naming
- **Prefix with sub-entity name**: `historyInputSchema`, `keyValueOutputSchema`, `metadataInputSchema`
- **Types**: `HistoryInput`, `KeyValueOutput`, `MetadataInput`

## Import Examples

### Using Barrel Exports (Recommended)

```typescript
// Import from root entity folder
import {
  createInputSchema,
  simpleOutputSchema,
  accountStatusSchema,
  // Sub-entity schemas
  historyInputSchema,
  keyValueOutputSchema,
} from "@/schemas/credential"

// Import from utils entities
import {
  createInputSchema as createContainerInput,
  simpleOutputSchema as containerOutput,
} from "@/schemas/utils/container"

// Import specific sub-entity
import {
  createWithSecretsInputSchema,
} from "@/schemas/utils/container/with-secrets"
```

### Direct Imports (If Needed)

```typescript
import { inputSchema } from "@/schemas/credential/input"
import { simpleOutputSchema } from "@/schemas/credential/output"
import { accountStatusSchema } from "@/schemas/credential/enums"
import { historyInputSchema } from "@/schemas/credential/history/input"
```

## Backward Compatibility

To ensure zero breaking changes, **deprecated aliases** are provided:

```typescript
// Old prefixed names still work (but show deprecated warnings)
/** @deprecated Use inputSchema instead */
export const credentialInputSchema = inputSchema
/** @deprecated Use Input instead */
export type CredentialInput = Input

/** @deprecated Use simpleOutputSchema instead */
export const credentialSimpleRoSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type CredentialSimpleRo = SimpleOutput
```

### Migration Guide

When updating code, replace old names with new unprefixed names:

| Old Name (Deprecated) | New Name |
|-----------------------|----------|
| `credentialInputSchema` | `inputSchema` (from `@/schemas/credential`) |
| `credentialDtoSchema` | `inputSchema` |
| `credentialSimpleRoSchema` | `simpleOutputSchema` |
| `credentialSimpleOutputSchema` | `simpleOutputSchema` |
| `CredentialDto` | `Input` |
| `CredentialSimpleRo` | `SimpleOutput` |

## Benefits of New Architecture

### 1. **Crystal Clear Organization**
- File names immediately tell you what they contain
- No redundant entity prefixes cluttering file names
- Easy to navigate: `credential/input.ts` → contains credential inputs

### 2. **Reduced Redundancy**
- Schema names are clean: `inputSchema` not `credentialInputSchema`
- Type names are simple: `Input` not `CredentialInput`
- Context provided by folder structure, not naming

### 3. **Better Scalability**
- Sub-entities follow same pattern as main entities
- Easy to add new sub-entities without naming conflicts
- Consistent across entire codebase

### 4. **Improved Imports**
- Barrel exports make imports clean
- No confusion about which file to import from
- IDE autocomplete works better

### 5. **Hierarchical Structure**
- Related schemas grouped in subfolders
- Clear parent-child relationships
- Logical organization mirrors entity relationships

## Refactored Entities

### Main Entities

- ✅ **credential** - input.ts, output.ts, enums.ts + 4 sub-entities
  - history/ - input.ts, output.ts
  - key-value/ - input.ts, output.ts
  - metadata/ - input.ts, output.ts
  - with-metadata/ - input.ts, output.ts

- ✅ **card** - input.ts, output.ts, enums.ts

- ✅ **secrets** - input.ts, output.ts

### Utils Entities

- ✅ **utils/container** - input.ts, output.ts, enums.ts
  - with-secrets/ - input.ts, output.ts

- ✅ **utils/platform** - input.ts, output.ts, enums.ts

- ✅ **utils/tag** - input.ts, output.ts

## Old vs New Comparison

### Old Structure (Before Refactor)
```
credential/
├── credential.input.ts       # 😞 Redundant prefix
├── credential.output.ts      # 😞 Redundant prefix
├── credential.enums.ts       # 😞 Redundant prefix
├── credential-history.ts     # 😞 Mixed DTOs and ROs
├── credential-metadata.ts    # 😞 Mixed DTOs and ROs
├── dto.ts                    # 😞 Redundant re-exports
└── index.ts
```

**Problems:**
- Redundant entity prefixes everywhere
- DTOs and ROs mixed in sub-entity files
- Confusing which file to import from
- No clear hierarchy

### New Structure (After Refactor)
```
credential/
├── input.ts                  # ✅ Clean name
├── output.ts                 # ✅ Clean name
├── enums.ts                  # ✅ Clean name
├── history/                  # ✅ Clear hierarchy
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
├── metadata/                 # ✅ Separate concerns
│   ├── input.ts
│   ├── output.ts
│   └── index.ts
└── index.ts
```

**Benefits:**
- No redundant prefixes
- Clear separation of concerns
- Hierarchical structure
- Easy to navigate and understand

## Best Practices

### 1. **Use Unprefixed Names**
```typescript
// ✅ Good - Clean, contextual names
export const inputSchema = z.object({ ... })
export const simpleOutputSchema = z.object({ ... })

// ❌ Avoid - Redundant prefixes
export const credentialInputSchema = z.object({ ... })
export const credentialSimpleOutputSchema = z.object({ ... })
```

### 2. **Import from Barrel Exports**
```typescript
// ✅ Good - Use barrel exports
import { inputSchema, simpleOutputSchema } from "@/schemas/credential"

// ❌ Avoid - Direct file imports (unless needed for specific reasons)
import { inputSchema } from "@/schemas/credential/input"
```

### 3. **Use Aliases for Disambiguation**
```typescript
// ✅ Good - Use import aliases when needed
import {
  inputSchema as credentialInput,
  outputSchema as credentialOutput,
} from "@/schemas/credential"

import {
  inputSchema as cardInput,
  outputSchema as cardOutput,
} from "@/schemas/card"
```

### 4. **Group Related Schemas in Subfolders**
```typescript
// ✅ Good - Create subfolders for related schemas
credential/
├── history/
├── metadata/
└── with-metadata/

// ❌ Avoid - Flat structure with prefixes
credential/
├── credential-history.ts
├── credential-metadata.ts
└── credential-with-metadata.ts
```

### 5. **Export Both Schemas and Types**
```typescript
// ✅ Good - Export schema and inferred type
export const inputSchema = z.object({ ... })
export type Input = z.infer<typeof inputSchema>

// Also provide backward compatibility
/** @deprecated Use inputSchema instead */
export const credentialInputSchema = inputSchema
```

## Contributing

When adding a new entity:

1. Create a new folder: `schemas/{entity}/`
2. Add three files: `input.ts`, `output.ts`, `enums.ts` (if needed)
3. Use unprefixed schema names: `inputSchema`, `outputSchema`
4. Add sub-entities in their own subfolders
5. Create `index.ts` for barrel exports
6. Add backward compatibility aliases for existing code
7. Update this README

When adding a sub-entity:

1. Create a subfolder under the parent entity
2. Follow the same pattern: `input.ts`, `output.ts`
3. Use descriptive names: `historyInputSchema`, not just `inputSchema`
4. Export from parent's `index.ts`

## Questions?

If you have questions about the schema architecture, please refer to:
- [Zero Locker Patterns](../PATTERNS.md)
- [Zero Locker Coding Rules](../CODING_RULES.md)

import { z } from "zod"

import {
  containerDtoSchema,
  containerSimpleRoSchema,
  deleteContainerDtoSchema,
  getContainerByIdDtoSchema,
  updateContainerDtoSchema,
} from "./container"
import {
  deletePlatformDtoSchema,
  getPlatformByIdDtoSchema,
  platformDtoSchema,
  platformSimpleRoSchema,
  updatePlatformDtoSchema,
} from "./platform"
import {
  deleteTagDtoSchema,
  getTagByIdDtoSchema,
  tagDtoSchema,
  tagSimpleRoSchema,
  updateTagDtoSchema,
} from "./tag"

// Container DTOs
export const createContainerInputSchema = containerDtoSchema
export const getContainerInputSchema = getContainerByIdDtoSchema
export const updateContainerInputSchema = updateContainerDtoSchema
export const deleteContainerInputSchema = deleteContainerDtoSchema

export const listContainersInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export const containerOutputSchema = containerSimpleRoSchema

export const listContainersOutputSchema = z.object({
  containers: z.array(containerOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

// Platform DTOs
export const createPlatformInputSchema = platformDtoSchema
export const getPlatformInputSchema = getPlatformByIdDtoSchema
export const updatePlatformInputSchema = updatePlatformDtoSchema
export const deletePlatformInputSchema = deletePlatformDtoSchema

export const listPlatformsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export const platformOutputSchema = platformSimpleRoSchema

export const listPlatformsOutputSchema = z.object({
  platforms: z.array(platformOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

// Tag DTOs
export const createTagInputSchema = tagDtoSchema
export const getTagInputSchema = getTagByIdDtoSchema
export const updateTagInputSchema = updateTagDtoSchema
export const deleteTagInputSchema = deleteTagDtoSchema

export const listTagsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

export const tagOutputSchema = tagSimpleRoSchema

export const listTagsOutputSchema = z.object({
  tags: z.array(tagOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

// Export types
export type CreateContainerInput = z.infer<typeof createContainerInputSchema>
export type GetContainerInput = z.infer<typeof getContainerInputSchema>
export type UpdateContainerInput = z.infer<typeof updateContainerInputSchema>
export type DeleteContainerInput = z.infer<typeof deleteContainerInputSchema>
export type ListContainersInput = z.infer<typeof listContainersInputSchema>

export type ContainerOutput = z.infer<typeof containerOutputSchema>
export type ListContainersOutput = z.infer<typeof listContainersOutputSchema>

export type CreatePlatformInput = z.infer<typeof createPlatformInputSchema>
export type GetPlatformInput = z.infer<typeof getPlatformInputSchema>
export type UpdatePlatformInput = z.infer<typeof updatePlatformInputSchema>
export type DeletePlatformInput = z.infer<typeof deletePlatformInputSchema>
export type ListPlatformsInput = z.infer<typeof listPlatformsInputSchema>

export type PlatformOutput = z.infer<typeof platformOutputSchema>
export type ListPlatformsOutput = z.infer<typeof listPlatformsOutputSchema>

export type CreateTagInput = z.infer<typeof createTagInputSchema>
export type GetTagInput = z.infer<typeof getTagInputSchema>
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>
export type DeleteTagInput = z.infer<typeof deleteTagInputSchema>
export type ListTagsInput = z.infer<typeof listTagsInputSchema>

export type TagOutput = z.infer<typeof tagOutputSchema>
export type ListTagsOutput = z.infer<typeof listTagsOutputSchema>

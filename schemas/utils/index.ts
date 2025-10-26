// Entity schemas - use namespace exports to avoid conflicts
export * as container from "./container"
export * as platform from "./platform"
export * as tag from "./tag"

// Utility schemas
export * from "./base-key-value-pair"
export * from "./breadcrumb"
export * from "./utils"
export * from "./webhook"
export * from "./article"

// Direct exports for commonly used schemas
export {
  // Container
  containerInputSchema,
  type ContainerInput,
  createContainerInputSchema,
  type CreateContainerInput,
  getContainerInputSchema,
  type GetContainerInput,
  updateContainerInputSchema,
  type UpdateContainerInput,
  deleteContainerInputSchema,
  type DeleteContainerInput,
  listContainersInputSchema,
  type ListContainersInput,
  containerSimpleOutputSchema,
  type ContainerSimpleOutput,
  listContainersOutputSchema,
  type ListContainersOutput,
  containersArrayOutputSchema,
  type ContainersArrayOutput,
  // Container Enums
  LIST_CONTAINER_TYPES,
  // Container Entity Type Schema
  getDefaultContainerForEntityInputSchema,
  type GetDefaultContainerForEntityInput,
} from "./container"

export {
  // Platform
  platformInputSchema,
  type PlatformInput,
  createPlatformInputSchema,
  type CreatePlatformInput,
  getPlatformInputSchema,
  type GetPlatformInput,
  updatePlatformInputSchema,
  type UpdatePlatformInput,
  deletePlatformInputSchema,
  type DeletePlatformInput,
  listPlatformsInputSchema,
  type ListPlatformsInput,
  platformSimpleOutputSchema,
  type PlatformSimpleOutput,
  listPlatformsOutputSchema,
  type ListPlatformsOutput,
} from "./platform"

export {
  // Tag
  tagInputSchema,
  type TagInput,
  createTagInputSchema,
  type CreateTagInput,
  getTagInputSchema,
  type GetTagInput,
  updateTagInputSchema,
  type UpdateTagInput,
  deleteTagInputSchema,
  type DeleteTagInput,
  listTagsInputSchema,
  type ListTagsInput,
  tagSimpleOutputSchema,
  type TagSimpleOutput,
  listTagsOutputSchema,
  type ListTagsOutput,
} from "./tag"

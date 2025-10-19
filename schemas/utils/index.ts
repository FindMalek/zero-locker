// Entity schemas - use namespace exports to avoid conflicts
export * as container from "./container"
export * as platform from "./platform"
export * as tag from "./tag"

// Utility schemas
export * from "./base-key-value-pair"
export * from "./breadcrumb"
export * from "./utils"

// Backward compatibility - export prefixed schemas from subdirectories
export {
  // Container
  containerInputSchema,
  containerDtoSchema,
  type ContainerInput,
  type ContainerDto,
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
  containerSimpleRoSchema,
  type ContainerSimpleOutput,
  type ContainerSimpleRo,
  containerOutputSchema,
  type ContainerOutput,
  listContainersOutputSchema,
  type ListContainersOutput,
  // Container Enums
  LIST_CONTAINER_TYPES,
} from "./container"

export {
  // Platform
  platformInputSchema,
  platformDtoSchema,
  type PlatformInput,
  type PlatformDto,
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
  platformSimpleRoSchema,
  type PlatformSimpleOutput,
  type PlatformSimpleRo,
  platformOutputSchema,
  type PlatformOutput,
  listPlatformsOutputSchema,
  type ListPlatformsOutput,
} from "./platform"

export {
  // Tag
  tagInputSchema,
  tagDtoSchema,
  type TagInput,
  type TagDto,
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
  tagSimpleRoSchema,
  type TagSimpleOutput,
  type TagSimpleRo,
  tagOutputSchema,
  type TagOutput,
  listTagsOutputSchema,
  type ListTagsOutput,
} from "./tag"

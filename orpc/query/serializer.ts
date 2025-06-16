import SuperJSON from "superjson"

// Register Date serialization
SuperJSON.registerCustom<Date, string>(
  {
    isApplicable: (v): v is Date => v instanceof Date,
    serialize: (v) => v.toISOString(),
    deserialize: (v) => new Date(v),
  },
  "date"
)

export const serializer = SuperJSON

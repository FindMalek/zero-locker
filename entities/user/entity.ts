import { UserSimpleOutput } from "@/schemas/user/user"

import { UserEntitySimpleDbData } from "./query"

export class UserEntity {
  static getSimpleRo(entity: UserEntitySimpleDbData): UserSimpleOutput {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      plan: entity.plan,
      image: entity.image,
      createdAt: entity.createdAt,
    }
  }
}

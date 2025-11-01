import { ProductEntitySimpleDbData } from "@/entities/subscription/product/query"
import { ProductSimpleOutput } from "@/schemas/subscription"

export class ProductEntity {
  static getSimpleRo(entity: ProductEntitySimpleDbData): ProductSimpleOutput {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: Number(entity.price),
      productId: entity.productId,
      variantId: entity.variantId,
      currency: entity.currency,
      interval: entity.interval,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }
}

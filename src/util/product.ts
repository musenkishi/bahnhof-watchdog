import { Product } from "../types/product"
import { Subscription } from "../types/subscription"

export const findProductAndConvertWithReduce = (
  products: Product[],
  searchString: string
): Subscription | null => {
  return products.reduce<Subscription | null>((acc, product) => {
    if (acc === null && product.internalTitle.includes(searchString)) {
      return { speed: product.title, price: product.price }
    }
    return acc
  }, null)
}

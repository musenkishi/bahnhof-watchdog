export type Discount = {
  availableOnlyWithBroadband: boolean
  inBundle: boolean
  hidden: boolean
  free: boolean
  price: number
  setupFee: number
  article: string | null
  discountPeriod: string | null
}

export type Campaign = {
  id: number
  title: string
  type: string
  description: string | null
}

export type Param = {
  name: string
  value: string
}

export type Category = {
  id: number
  type: string
  title: string
  description: string
  hidden: boolean
}

export type ProductNetwork = {
  city: string
  network: string
}

export type Product = {
  type: string
  discount: Discount
  bundle: unknown | null
  contractPeriod: number
  cancellationTime: number
  campaign: Campaign
  params: Param[]
  category: Category
  title: string
  network: ProductNetwork
  id: number
  internalTitle: string
  description: string
  article: string
  price: number
  setupFee: number
  billingPeriod: number
  hidden: boolean
}

export type ProductsData = {
  products: Product[]
  hasOtherProducts: boolean
}

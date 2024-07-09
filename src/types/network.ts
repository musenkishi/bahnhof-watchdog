export type Network = {
  label: string
  value: string
  name: string
  city: string
  showInstallCost: boolean
  redirectUrl: string
}

export type NetworkData = {
  type: string
  networks: Network[]
}

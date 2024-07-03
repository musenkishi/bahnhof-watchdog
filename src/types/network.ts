export type Network = {
  label: string
  value: string
  name: string
  city: string
  showInstallCost: boolean
  redirectUrl: string
}

export type NetworkResponse = {
  status: string
  data: {
    type: string
    networks: Network[]
  }
}
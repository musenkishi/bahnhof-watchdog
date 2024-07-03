export type Message = {
  message: string
  createdAt: string
}

export type Operation = {
  id: string
  lastUpdated: string
  title: string
  messages: Message[]
}

export type OperationsResponse = {
  status: string
  data: {
    open: Operation[]
    future: Operation[]
    closed: Operation[]
    all: Operation[]
  }
}

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

export type OperationsData = {
  open: Operation[]
  future: Operation[]
  closed: Operation[]
  all: Operation[]
}

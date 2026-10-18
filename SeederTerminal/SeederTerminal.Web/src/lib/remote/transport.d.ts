export function createRemoteTransport(handlers: Record<string, any>): {
  start(): void
  stop(): void
  send(cmd: string): void
}

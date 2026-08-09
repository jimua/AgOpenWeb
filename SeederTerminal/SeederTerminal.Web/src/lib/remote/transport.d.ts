declare module '*.js' {
  export function createRemoteTransport(handlers: Record<string, (...args: any[]) => void>): {
    start(): void
    stop(): void
    send(cmd: string): void
  }
}

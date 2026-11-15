// AgOpenWeb
// Copyright (C) 2024-2026 AgOpenWeb Contributors
// SPDX-License-Identifier: Apache-2.0

export function createDisplayTextureReporter(send: (command: string) => void) {
  let side = 0
  let operator = false
  let reportedSide = 0

  function report() {
    if (!operator || side <= 2 || side === reportedSide) return
    send(`display.maxTexture|${side}`)
    reportedSide = side
  }

  return {
    setLimit(limit: number) {
      side = limit
      report()
    },
    setOperator(holdsControl: boolean) {
      operator = holdsControl
      report()
    },
    disconnect() {
      operator = false
      reportedSide = 0
    },
  }
}

import { writable } from 'svelte/store'

/** Camera: px per metre (zoom) and follow mode. */
export const pxPerM = writable(12)
export const followVehicle = writable(true)
export const northUp = writable(false)

export function zoomIn() {
  pxPerM.update((z) => Math.min(80, z * 1.25))
}

export function zoomOut() {
  pxPerM.update((z) => Math.max(2, z / 1.25))
}

export function cycleCameraMode() {
  // Toggle north-up vs heading-up while staying in follow.
  northUp.update((v) => !v)
  followVehicle.set(true)
}

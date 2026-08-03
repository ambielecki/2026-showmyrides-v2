import type { RideProcessingStatus } from '@/types/rides'

export function formatDistance(distance: number | null): string {
  return distance === null ? '—' : `${distance.toFixed(2)} mi`
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null) {
    return '—'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function formatRideDate(date: string | null): string {
  if (!date) {
    return 'Awaiting activity data'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function isRideProcessing(status: RideProcessingStatus): boolean {
  return status === 'pending' || status === 'processing'
}

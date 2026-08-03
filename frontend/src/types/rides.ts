export type RideProcessingStatus = 'pending' | 'processing' | 'complete' | 'failed'
export type RideRange = 'all' | 'week' | 'month' | 'year'
export type RidePageSize = 10 | 25 | 50

export interface RideLocation {
  external_id: string
  name: string
  map_provider: 'openstreetmap' | 'watopia' | 'makuri-islands' | string
}

export interface RouteData {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface RideSummary {
  external_id: string
  name: string
  description: string | null
  ride_datetime: string | null
  distance: number | null
  moving_time: number | null
  processing_status: RideProcessingStatus
  processing_error: string | null
  location: RideLocation
}

export interface Ride extends RideSummary {
  total_time: number | null
  average_speed: number | null
  max_speed: number | null
  route_data: RouteData | null
}

export interface RideFilters {
  location: string
  range: RideRange
  perPage: RidePageSize
  page: number
}

export interface PaginatedRides {
  data: RideSummary[]
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface RideInput {
  name: string
  description: string | null
}

export interface CreateRideInput extends RideInput {
  locationExternalId: string
  fitFile: File
}

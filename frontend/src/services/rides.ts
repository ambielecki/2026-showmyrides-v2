import { httpService } from '@/services/http'
import type {
  CreateRideInput,
  PaginatedRides,
  Ride,
  RideFilters,
  RideInput,
  RideLocation,
} from '@/types/rides'

interface RideResponse {
  data: Ride
}

interface LocationOptionsResponse {
  data: RideLocation[]
}

export const rideService = {
  list(filters: RideFilters): Promise<PaginatedRides> {
    const params = new URLSearchParams({
      page: String(filters.page),
      per_page: String(filters.perPage),
      range: filters.range,
    })

    if (filters.location) {
      params.set('location', filters.location)
    }

    return httpService.get<PaginatedRides>(`/api/rides?${params.toString()}`)
  },

  async get(externalId: string): Promise<Ride> {
    const response = await httpService.get<RideResponse>(
      `/api/rides/${encodeURIComponent(externalId)}`,
    )

    return response.data
  },

  async create(input: CreateRideInput): Promise<Ride> {
    const formData = new FormData()
    formData.set('name', input.name)
    formData.set('description', input.description ?? '')
    formData.set('location_external_id', input.locationExternalId)
    formData.set('fit_file', input.fitFile)

    const response = await httpService.post<RideResponse>('/api/rides', formData)

    return response.data
  },

  async update(externalId: string, input: RideInput): Promise<Ride> {
    const response = await httpService.patch<RideResponse>(
      `/api/rides/${encodeURIComponent(externalId)}`,
      input,
    )

    return response.data
  },

  delete(externalId: string): Promise<void> {
    return httpService.delete<void>(`/api/rides/${encodeURIComponent(externalId)}`)
  },

  async locations(): Promise<RideLocation[]> {
    const response = await httpService.get<LocationOptionsResponse>('/api/location-options')

    return response.data
  },
}

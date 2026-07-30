import { httpService } from '@/services/http'
import type {
  Location,
  LocationInput,
  LocationSearchResult,
  PaginatedLocations,
} from '@/types/locations'

interface LocationResponse {
  data: Location
}

interface LocationSearchResponse {
  data: LocationSearchResult[]
}

export const locationService = {
  list(page: number): Promise<PaginatedLocations> {
    return httpService.get<PaginatedLocations>(`/api/locations?page=${page}`)
  },

  async create(input: LocationInput): Promise<Location> {
    const response = await httpService.post<LocationResponse>('/api/locations', input)

    return response.data
  },

  async update(externalId: string, input: LocationInput): Promise<Location> {
    const response = await httpService.patch<LocationResponse>(
      `/api/locations/${encodeURIComponent(externalId)}`,
      input,
    )

    return response.data
  },

  async search(query: string): Promise<LocationSearchResult[]> {
    const response = await httpService.get<LocationSearchResponse>(
      `/api/location-search?query=${encodeURIComponent(query)}`,
    )

    return response.data
  },
}

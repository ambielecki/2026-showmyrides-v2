export interface Location {
  external_id: string
  name: string
  latitude: number
  longitude: number
}

export interface LocationInput {
  name: string
  latitude: number
  longitude: number
}

export interface LocationSearchResult {
  name: string
  display_name: string
  latitude: number
  longitude: number
}

export interface PaginatedLocations {
  data: Location[]
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

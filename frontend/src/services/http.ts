export type ValidationErrors = Record<string, string[]>

interface ErrorResponse {
  message?: unknown
  errors?: unknown
}

interface RequestOptions {
  body?: unknown
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'
  requiresCsrf?: boolean
}

export class HttpError extends Error {
  readonly status: number
  readonly validationErrors: ValidationErrors

  constructor(message: string, status: number, validationErrors: ValidationErrors = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.validationErrors = validationErrors
  }
}

export class HttpService {
  readonly baseUrl: string

  constructor(baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path)
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      body,
      method: 'POST',
      requiresCsrf: true,
    })
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      body,
      method: 'PATCH',
      requiresCsrf: true,
    })
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    if (options.requiresCsrf) {
      await this.initializeCsrf()
    }

    const headers = new Headers({
      Accept: 'application/json',
    })

    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json')
    }

    if (options.requiresCsrf) {
      const csrfToken = this.getCookie('XSRF-TOKEN')

      if (csrfToken) {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(csrfToken))
      }
    }

    const response = await fetch(this.url(path), {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'include',
      headers,
      method: options.method ?? 'GET',
    })

    if (!response.ok) {
      throw await this.toHttpError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const responseText = await response.text()

    if (!responseText) {
      return undefined as T
    }

    return JSON.parse(responseText) as T
  }

  private async initializeCsrf(): Promise<void> {
    const response = await fetch(this.url('/sanctum/csrf-cookie'), {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw await this.toHttpError(response)
    }
  }

  private getCookie(name: string): string | undefined {
    const prefix = `${name}=`

    return document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length)
  }

  private async toHttpError(response: Response): Promise<HttpError> {
    let responseBody: ErrorResponse = {}

    try {
      responseBody = (await response.json()) as ErrorResponse
    } catch {
      responseBody = {}
    }

    const message =
      typeof responseBody.message === 'string' ? responseBody.message : 'Request failed.'

    return new HttpError(message, response.status, this.toValidationErrors(responseBody.errors))
  }

  private toValidationErrors(errors: unknown): ValidationErrors {
    if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
      return {}
    }

    return Object.fromEntries(
      Object.entries(errors).flatMap(([field, messages]) => {
        if (!Array.isArray(messages)) {
          return []
        }

        const stringMessages = messages.filter(
          (message): message is string => typeof message === 'string',
        )

        return stringMessages.length > 0 ? [[field, stringMessages]] : []
      }),
    )
  }

  private url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`
  }
}

export const httpService = new HttpService()

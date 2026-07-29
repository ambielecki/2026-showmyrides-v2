import { afterEach, describe, expect, it, vi } from 'vitest'

import { HttpError, HttpService } from '@/services/http'

afterEach(() => {
  vi.unstubAllGlobals()
  document.cookie = 'XSRF-TOKEN=; Max-Age=0; Path=/'
})

describe('HttpService', () => {
  it('initializes Sanctum CSRF and sends credentialed JSON requests', async () => {
    document.cookie = 'XSRF-TOKEN=encoded%20token; Path=/'
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ two_factor: false }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const service = new HttpService('http://localhost:8080/')
    const result = await service.post<{ two_factor: boolean }>('/login', {
      email: 'rider@example.com',
      password: 'password',
    })

    expect(result).toEqual({ two_factor: false })
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8080/sanctum/csrf-cookie',
      expect.objectContaining({ credentials: 'include' }),
    )

    const request = fetchMock.mock.calls[1]?.[1] as RequestInit
    const headers = request.headers as Headers

    expect(request.credentials).toBe('include')
    expect(request.method).toBe('POST')
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('X-XSRF-TOKEN')).toBe('encoded token')
  })

  it('normalizes Laravel validation responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            message: 'The given data was invalid.',
            errors: {
              email: ['The email field is required.'],
            },
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 422,
          },
        ),
      ),
    )

    const service = new HttpService('http://localhost:8080')

    await expect(service.get('/api/user')).rejects.toEqual(
      new HttpError('The given data was invalid.', 422, {
        email: ['The email field is required.'],
      }),
    )
  })
})

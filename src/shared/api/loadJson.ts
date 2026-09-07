const jsonCache = new Map<string, Promise<unknown>>()

// 같은 URL을 여러 씬이 동시에 요청하므로 in-flight promise를 공유한다.
export function loadJson<T>(url: string): Promise<T> {
  const cached = jsonCache.get(url)
  if (cached) return cached as Promise<T>

  const request = fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`)
    }
    return response.json() as Promise<T>
  })

  jsonCache.set(url, request)
  return request
}

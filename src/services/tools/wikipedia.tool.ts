interface WikipediaSummary {
  extract?: string
  title?: string
}

export const searchWikipedia = async (query: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )

    if (response.status === 404) {
      return `Wikipedia did not find a summary for "${query}". Try a different phrase.`
    }

    if (!response.ok) {
      throw new Error('wikipedia_failed')
    }

    const data = (await response.json()) as WikipediaSummary
    const extract = data.extract?.trim()

    if (!extract) {
      return `Could not get a short summary for "${query}".`
    }

    const truncated = extract.length > 300 ? `${extract.slice(0, 297).trim()}...` : extract
    return `${data.title ?? query}: ${truncated}`
  } catch {
    throw new Error('Could not reach Wikipedia because of a network error. Try again later.')
  }
}

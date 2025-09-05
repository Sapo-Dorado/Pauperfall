interface CardData {
  id: string;
  name: string;
  image_uris?: {
    small: string;
  };
  mana_cost?: string;
  type_line?: string;
  scryfall_uri?: string;
}

interface SearchResponse {
  data: CardData[];
  total_cards: number;
  has_more?: boolean;
  next_page?: string;
}

const REQUIRED_TAGS = [
  'legal:pauper',
];

type StaplesEntry = {
  popularityScore: number;
  decks: number;
};

const DEFAULT_STAPLES_ENTRY: StaplesEntry = { popularityScore: 0, decks: 0 };

type EasterEgg = { key: string; value: string };
// Ordered list; earlier entries take precedence on multiple matches
const EASTER_EGGS: EasterEgg[] = [
  { key: 'best card in pauper', value: 'artful dodge' },
];

async function loadStaplesMap(): Promise<Record<string, StaplesEntry>> {
  try {
    const res = await fetch('/mtg_pauper_staples.json');
    if (!res.ok) throw new Error(`Failed to load staples json: ${res.status}`);
    const json = await res.json();

    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new Error('Staples JSON must be an object mapping card name to {popularityScore, decks}');
    }

    const map: Record<string, StaplesEntry> = {};
    for (const [name, value] of Object.entries(json as Record<string, StaplesEntry>)) {
      map[name.toLowerCase()] = { popularityScore: value.popularityScore, decks: value.decks };
    }

    return map;
  } catch (e) {
    console.error('Error loading staples map:', e);
    return {};
  }
}

/**
 * Builds a search query by adding required tags if they don't already exist
 */
function buildSearchQuery(userQuery: string): string {
  // Easter egg override: if any key is present in the query, return its mapped value
  const lower = userQuery.toLowerCase();
  for (const egg of EASTER_EGGS) {
    if (lower.includes(egg.key.toLowerCase())) {
      return egg.value;
    }
  }

  const queryParts = [userQuery.trim()];
  
  // Add each required tag if it's not already present
  REQUIRED_TAGS.forEach(tag => {
    const lowerQuery = userQuery.toLowerCase();
    const lowerTag = tag.toLowerCase();
    
    if (!lowerQuery.includes(lowerTag)) {
      queryParts.push(tag);
    }
  });
  
  return queryParts.join(' ');
}

async function fetchJson(url: string): Promise<SearchResponse | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return (await resp.json()) as SearchResponse;
  } catch (e) {
    console.error('Fetch error:', e);
    return null;
  }
}

/**
 * Searches for Magic: The Gathering cards using the Scryfall API
 */
export async function searchCards(query: string): Promise<{
  success: boolean;
  data?: CardData[];
  error?: string;
}> {
  if (!query.trim()) {
    return {
      success: true,
      data: [],
    };
  }

  try {
    const searchQuery = buildSearchQuery(query);
    const firstUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`;
    const first = await fetchJson(firstUrl);

    if (!first) {
      return {
        success: false,
        error: 'Failed to fetch search results.',
      };
    }

    // If Scryfall returns HTTP 404 for no results, fetchJson would be null; otherwise continue
    const allData: CardData[] = [...(first.data || [])];

    const firstCount = first.data?.length || 0;
    const totalCards = first.total_cards || firstCount;

    // Determine total pages; avoid division by zero
    const totalPages = firstCount > 0 ? Math.ceil(totalCards / firstCount) : 1;

    // Build requests for pages 2..n using next_page as the template
    if (totalPages > 1 && first.next_page) {
      const urls: string[] = [];
      for (let page = 2; page <= totalPages; page += 1) {
        const u = new URL(first.next_page);
        u.searchParams.set('page', String(page));
        urls.push(u.toString());
      }

      // Fetch all remaining pages in parallel
      const pages = await Promise.all(urls.map((u) => fetchJson(u)));
      for (const res of pages) {
        if (res && Array.isArray(res.data)) {
          allData.push(...res.data);
        }
      }
    }

    // Load staples map and sort results: popularityScore desc, then decks desc, then name
    const staplesMap = await loadStaplesMap();
    const sorted = allData.sort((a, b) => {
      const aEntry = staplesMap[a.name.toLowerCase()] ?? DEFAULT_STAPLES_ENTRY;
      const bEntry = staplesMap[b.name.toLowerCase()] ?? DEFAULT_STAPLES_ENTRY;

      if (bEntry.popularityScore !== aEntry.popularityScore) {
        return bEntry.popularityScore - aEntry.popularityScore;
      }
      if (bEntry.decks !== aEntry.decks) {
        return bEntry.decks - aEntry.decks;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      success: true,
      data: sorted,
    };
  } catch (err) {
    console.error('Search error:', err);
    return {
      success: false,
      error: 'An error occurred while searching. Please try again.',
    };
  }
}

export type { CardData };

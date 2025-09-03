interface CardData {
  id: string;
  name: string;
  image_uris?: {
    small: string;
  };
  mana_cost?: string;
  type_line?: string;
}

interface SearchResponse {
  data: CardData[];
  total_cards: number;
}

const REQUIRED_TAGS = [
  'legal:pauper',
];

async function loadStaplesMap(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/mtg_pauper_staples.json');
    if (!res.ok) throw new Error(`Failed to load staples json: ${res.status}`);
    const json = await res.json();

    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      throw new Error('Staples JSON must be an object mapping card name to number');
    }

    const map: Record<string, number> = {};
    for (const [name, value] of Object.entries(json as Record<string, unknown>)) {
      map[name.toLowerCase()] = Number(value);
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
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: true,
          data: [],
          error: 'No cards found matching your search.',
        };
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data: SearchResponse = await response.json();

    // Load staples map and sort results by value (desc), default 0 when missing
    const staplesMap = await loadStaplesMap();
    const sorted = [...data.data].sort((a, b) => {
      const av = staplesMap[a.name.toLowerCase()] ?? 0;
      const bv = staplesMap[b.name.toLowerCase()] ?? 0;
      if (bv !== av) return bv - av;
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

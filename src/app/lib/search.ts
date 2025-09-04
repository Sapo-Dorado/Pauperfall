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
}

const REQUIRED_TAGS = [
  'legal:pauper',
];

type StaplesEntry = {
  popularityScore: number;
  decks: number;
};

const DEFAULT_STAPLES_ENTRY: StaplesEntry = { popularityScore: 0, decks: 0 };

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

    // Load staples map and sort results: popularityScore desc, then decks desc, then name
    const staplesMap = await loadStaplesMap();
    const sorted = [...data.data].sort((a, b) => {
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

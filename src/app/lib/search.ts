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
    return {
      success: true,
      data: data.data,
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

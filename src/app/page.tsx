'use client';

import { useState } from 'react';

interface Card {
  id: string;
  name: string;
  image_uris?: {
    small: string;
  };
  mana_cost?: string;
  type_line?: string;
}

interface SearchResponse {
  data: Card[];
  total_cards: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError('');
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setSearchResults([]);
          setError('No cards found matching your search.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.data);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    handleSearch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Pauperfall
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Search Magic: The Gathering cards
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search for cards (e.g., 'lightning bolt', 'island', 'creature:goblin')"
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-full shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900"
              />
            </div>
            <button
              onClick={handleSearchClick}
              disabled={isLoading || !searchQuery.trim()}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          </div>
        )}

        {/* Search Results */}
        {hasSearched && searchResults.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Found {searchResults.length} cards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((card) => (
                <div
                  key={card.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {card.image_uris?.small && (
                    <img
                      src={card.image_uris.small}
                      alt={card.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
                      {card.name}
                    </h3>
                    {card.mana_cost && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                        Cost: {card.mana_cost}
                      </p>
                    )}
                    {card.type_line && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {card.type_line}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Only show after searching */}
        {hasSearched && !isLoading && !error && searchResults.length === 0 && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              No cards found. Try a different search term.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

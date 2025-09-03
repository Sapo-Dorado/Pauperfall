'use client';

import { useState } from 'react';
import Card from './components/Card';

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
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
      <div className={`container mx-auto px-4 ${!hasSearched ? 'h-screen flex flex-col justify-center' : 'py-16'}`}>
        {/* Header */}
        <div className={`text-center ${!hasSearched ? 'mb-20' : 'mb-16'}`}>
          <h1 className={`font-bold text-gray-800 dark:text-white mb-4 ${!hasSearched ? 'text-7xl' : 'text-5xl'}`}>
            Pauperfall
          </h1>
          <p className={`text-gray-600 dark:text-gray-300 ${!hasSearched ? 'text-2xl' : 'text-xl'}`}>
            Search Magic: The Gathering cards
          </p>
        </div>

        {/* Search Bar */}
        <div className={`mx-auto ${!hasSearched ? 'w-full px-8 mb-20' : 'max-w-2xl mb-16'}`}>
          <div className={`flex ${!hasSearched ? 'gap-6 max-w-5xl mx-auto' : 'gap-4'}`}>
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search for cards (e.g., 'lightning bolt', 'island', 'creature:goblin')"
                className={`w-full border-2 border-gray-300 rounded-full shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900 ${
                  !hasSearched 
                    ? 'px-8 py-6 text-2xl border-3 focus:ring-6' 
                    : 'px-6 py-4 text-lg'
                }`}
              />
            </div>
            <button
              onClick={handleSearchClick}
              disabled={isLoading || !searchQuery.trim()}
              className={`bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600 ${
                !hasSearched 
                  ? 'px-12 py-6 text-xl shadow-xl focus:ring-6' 
                  : 'px-8 py-4'
              }`}
            >
              {isLoading ? (
                <div className={`flex items-center gap-2 ${!hasSearched ? 'gap-3' : 'gap-2'}`}>
                  <div className={`animate-spin rounded-full border-b-2 border-white ${!hasSearched ? 'h-6 w-6' : 'h-5 w-5'}`}></div>
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
                <Card
                  key={card.id}
                  card={card}
                />
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

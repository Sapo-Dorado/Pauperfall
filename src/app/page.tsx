'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from './components/Card';
import { searchCards, type CardData } from './lib/search';

export default function Home() {
  const SEARCH_PLACEHOLDER = "Search for cards (e.g., 'lightning bolt', 'island', 'color:U')";
  const SUBTITLE = "Search Magic: The Gathering Pauper cards";
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Check for search query in URL on component mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setSearchQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError('');
      setHasSearched(false);
      // Clear URL when search is empty
      router.push('/');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    router.push(url.pathname + url.search);

    const result = await searchCards(query);
    
    if (result.success) {
      setSearchResults(result.data || []);
      if (result.error) {
        setError(result.error);
      }
    } else {
      setError(result.error || 'An error occurred while searching.');
      setSearchResults([]);
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    handleSearch(searchQuery);
  };

  const handleHomeClick = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    setHasSearched(false);
    // Clear URL when going home
    router.push('/');
  };

  // Initial search state (no results yet)
  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 h-screen flex flex-col justify-center">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-7xl font-bold text-gray-800 dark:text-white mb-6 select-none">
              Pauperfall
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 select-none">
              {SUBTITLE}
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full px-8 mb-20">
            <div className="flex gap-6 max-w-5xl mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={SEARCH_PLACEHOLDER}
                  className="w-full px-8 py-6 text-2xl border-3 border-gray-300 rounded-full shadow-xl focus:outline-none focus:border-blue-500 focus:ring-6 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900"
                />
              </div>
              <button
                onClick={handleSearchClick}
                disabled={isLoading || !searchQuery.trim()}
                className="px-12 py-6 bg-blue-600 text-white font-bold text-xl rounded-full shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-6 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            <div className="max-w-5xl mx-auto mt-4 text-center text-gray-600 dark:text-gray-400">
              Search for Pauper legal cards using Scryfall syntax, sorted by <span className="font-semibold">Pauper</span>larity
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Search results state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <button
            onClick={handleHomeClick}
            className="text-5xl font-bold text-gray-800 dark:text-white mb-4 cursor-pointer select-none"
          >
            Pauperfall
          </button>
          <p className="text-xl text-gray-600 dark:text-gray-300 select-none">
            {SUBTITLE}
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
                onKeyDown={handleKeyDown}
                                  placeholder={SEARCH_PLACEHOLDER}
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

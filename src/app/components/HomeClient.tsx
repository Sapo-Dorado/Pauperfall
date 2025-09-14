'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from './Card';
import Footer from './Footer';
import { searchCards, type CardData } from '../lib/search';

interface HomeClientProps {
	initialQuery?: string;
}

const PAGE_SIZE = 176;

export default function HomeClient({ initialQuery }: HomeClientProps) {
	const SEARCH_PLACEHOLDER = "Search for cards (e.g., 'lightning bolt', 'island', 'color:U')";
	const SUBTITLE = "Search Magic: The Gathering Pauper cards";

	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState('');
	const [searchResults, setSearchResults] = useState<CardData[]>([]);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [hasSearched, setHasSearched] = useState(false);

	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (initialQuery && initialQuery.trim()) {
			setSearchQuery(initialQuery);
			handleSearch(initialQuery);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialQuery]);

	const handleSearch = async (query: string) => {
		if (!query.trim()) {
			setSearchResults([]);
			setVisibleCount(PAGE_SIZE);
			setError('');
			setHasSearched(false);
			router.push('/');
			return;
		}

		setIsLoading(true);
		setError('');
		setHasSearched(true);

		const url = new URL(window.location.href);
		url.searchParams.set('q', query);
		router.push(url.pathname + url.search);

		const result = await searchCards(query);
		if (result.success) {
			const data = result.data || [];
			setSearchResults(data);
			setVisibleCount(Math.min(PAGE_SIZE, data.length));
			if (result.error) setError(result.error);
		} else {
			setError(result.error || 'An error occurred while searching.');
			setSearchResults([]);
			setVisibleCount(PAGE_SIZE);
		}
		setIsLoading(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') handleSearch(searchQuery);
	};

	const handleSearchClick = () => {
		handleSearch(searchQuery);
	};

	const handleHomeClick = () => {
		setSearchQuery('');
		setSearchResults([]);
		setVisibleCount(PAGE_SIZE);
		setError('');
		setHasSearched(false);
		router.push('/');
	};

	// Infinite scroll observer
	useEffect(() => {
		if (!sentinelRef.current) return;
		const el = sentinelRef.current;
		const observer = new IntersectionObserver((entries) => {
			const [entry] = entries;
			if (entry.isIntersecting) {
				setVisibleCount((prev) => {
					if (prev >= searchResults.length) return prev;
					return Math.min(prev + PAGE_SIZE, searchResults.length);
				});
			}
		}, { rootMargin: '200px' });
		observer.observe(el);
		return () => observer.disconnect();
	}, [searchResults.length]);

	if (!hasSearched) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
				<div className="container mx-auto px-4 h-screen flex flex-col justify-center">
					<div className="text-center mb-20">
						<div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 select-none">
							<Image src="/anglerfish-fish.svg" alt="Pauperfall logo" width={64} height={64} className="h-12 w-12 sm:h-16 sm:w-16" />
							<h1 className="text-4xl sm:text-7xl font-bold text-gray-800 dark:text-white">Pauperfall</h1>
						</div>
						<p className="text-lg sm:text-2xl text-gray-600 dark:text-gray-300 select-none">{SUBTITLE}</p>
					</div>

					<div className="w-full px-4 sm:px-8 mb-20">
						<div className="flex gap-3 sm:gap-6 max-w-5xl mx-auto">
							<div className="relative flex-1">
								<input
									type="text"
									value={searchQuery}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									placeholder={SEARCH_PLACEHOLDER}
									className="w-full px-4 py-3 sm:px-8 sm:py-6 text-lg sm:text-2xl border-2 sm:border-3 border-gray-300 rounded-full shadow-xl focus:outline-none focus:border-blue-500 focus:ring-4 sm:focus:ring-6 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900"
								/>
							</div>
							<button
								onClick={handleSearchClick}
								disabled={isLoading || !searchQuery.trim()}
								className="px-6 py-3 sm:px-12 sm:py-6 bg-blue-600 text-white font-bold text-base sm:text-xl rounded-full shadow-xl hover:bg-blue-700 focus:outline-none focus:ring-4 sm:focus:ring-6 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
							>
								{isLoading ? (
									<div className="flex items-center gap-2 sm:gap-3">
										<div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-b-2 border-white"></div>
										<span className="hidden sm:inline">Searching...</span>
									</div>
								) : (
									'Search'
								)}
							</button>
						</div>
						<div className="max-w-5xl mx-auto mt-4 text-center text-gray-600 dark:text-gray-400 select-none">
							Search for Pauper legal cards using Scryfall syntax, sorted by <span className="font-semibold">Pauper</span>larity
						</div>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-16">
				<div className="text-center mb-16">
					<button onClick={handleHomeClick} className="text-3xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-4 cursor-pointer select-none inline-flex items-center gap-2 sm:gap-3">
						<Image src="/anglerfish-fish.svg" alt="Pauperfall logo" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10" />
						<span>Pauperfall</span>
					</button>
					<p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 select-none">{SUBTITLE}</p>
				</div>

				<div className="max-w-2xl mx-auto mb-16">
					<div className="flex gap-2 sm:gap-4">
						<div className="relative flex-1">
							<input
								type="text"
								value={searchQuery}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								placeholder={SEARCH_PLACEHOLDER}
								className="w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg border-2 border-gray-300 rounded-full shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-900"
							/>
						</div>
						<button
							onClick={handleSearchClick}
							disabled={isLoading || !searchQuery.trim()}
							className="px-4 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold text-sm sm:text-base rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
						>
							{isLoading ? (
								<div className="flex items-center gap-1 sm:gap-2">
									<div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
									<span className="hidden sm:inline">Searching...</span>
								</div>
							) : (
								'Search'
							)}
						</button>
					</div>
				</div>

				{/* Results */}
				<div className="max-w-6xl mx-auto">
					{searchResults.length > 0 && (
						<>
							<h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Found {searchResults.length} cards</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{searchResults.slice(0, visibleCount).map((card) => (
									<Card key={card.id} card={card} />
								))}
							</div>
							<div ref={sentinelRef} className="h-10" />
							{visibleCount < searchResults.length && (
								<div className="mt-6 text-center text-gray-500 dark:text-gray-400">Loading more…</div>
							)}
						</>
					)}
					{error && (
						<div className="max-w-2xl mx-auto mb-8">
							<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">{error}</div>
						</div>
					)}
				</div>
			</div>
			<Footer />
		</div>
	);
}

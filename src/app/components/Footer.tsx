export default function Footer() {
	return (
		<footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
			Card search powered by{' '}
			<a
				href="https://scryfall.com/docs/api"
				target="_blank"
				rel="noopener noreferrer"
				className="underline hover:no-underline"
			>
				Scryfall API
			</a>
			. Pauper staples data from{' '}
			<a
				href="https://mtgdecks.net/Pauper/staples"
				target="_blank"
				rel="noopener noreferrer"
				className="underline hover:no-underline"
			>
				MTGDecks.net
			</a>
			. Magic: The Gathering is © Wizards of the Coast.
            Vectors and icons by <a href="https://www.behance.net/oradeejingpo?ref=svgrepo.com" target="_blank">Oradee Jingpo</a> in CC Attribution License via <a href="https://www.svgrepo.com/" target="_blank">SVG Repo</a>

		</footer>
	);
}

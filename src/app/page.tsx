import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './components/HomeClient';

export function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Metadata {
	const raw = searchParams.q;
	const q = Array.isArray(raw) ? raw[0] : raw;
	const baseTitle = 'Pauperfall - Magic: The Gathering Pauper Card Search';
	if (q && q.trim()) {
		return { title: `Pauperfall: ${q}` };
	}
	return { title: baseTitle };
}

export default function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const raw = searchParams.q;
	const initialQuery = Array.isArray(raw) ? raw[0] : raw;
	return (
		<Suspense fallback={null}>
			<HomeClient initialQuery={initialQuery} />
		</Suspense>
	);
}

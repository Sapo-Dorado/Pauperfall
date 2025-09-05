import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './components/HomeClient';

export async function generateMetadata({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
	const {q} = await searchParams;
	const initialQuery = Array.isArray(q) ? q[0] : q;
	const baseTitle = 'Pauperfall - Magic: The Gathering Pauper Card Search';
	if (initialQuery && initialQuery.trim()) {
		return { title: `Pauperfall: ${initialQuery}` };
	}
	return { title: baseTitle };
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const {q} = await searchParams;
	const initialQuery = Array.isArray(q) ? q[0] : q;
	return (
		<Suspense fallback={null}>
			<HomeClient initialQuery={initialQuery} />
		</Suspense>
	);
}

'use client';

import Image from 'next/image';
import { useState } from 'react';
import FlipIcon from './FlipIcon';

interface ImageURIs {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
}

interface CardFace {
  name: string;
  image_uris?: ImageURIs;
}

interface CardData {
  id: string;
  name: string;
  card_faces: CardFace[];
  mana_cost?: string;
  type_line?: string;
  scryfall_uri?: string;
}

interface CardProps {
  card: CardData;
}

function getImageUri(image_uris?: ImageURIs): string | null {
  return image_uris?.normal || image_uris?.small || image_uris?.large || image_uris?.png || null;
}

export default function Card({ card }: CardProps) {
  const { name, card_faces, scryfall_uri } = card;
  const [currentFace, setCurrentFace] = useState(0);

  const isDoubleFaced = card_faces.length > 1;
  const href = scryfall_uri || `https://scryfall.com/search?q=${encodeURIComponent(name)}`;
  const imageUrl = getImageUri(card_faces[currentFace]?.image_uris);

  const handleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentFace(prev => (prev === 0 ? 1 : 0));
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
      title={`View ${name} on Scryfall`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={card_faces[currentFace]?.name || name}
          width={488}
          height={680}
        />
      )}

      {isDoubleFaced && (
        <button
          onClick={handleFlip}
          className="absolute bottom-4 left-4 bg-white/40 hover:bg-white/90 text-black rounded-full p-2 transition-colors duration-200"
          title="Flip card"
          aria-label="Flip card"
        >
          <FlipIcon />
        </button>
      )}
    </a>
  );
}

import Image from 'next/image';

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

interface CardProps {
  card: CardData;
}

export default function Card({ card }: CardProps) {
  const { name, image_uris, scryfall_uri } = card;
  const href = scryfall_uri || `https://scryfall.com/search?q=${encodeURIComponent(name)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      title={`View ${name} on Scryfall`}
    >
      {image_uris?.small && (
        <Image
          src={image_uris.small}
          alt={name}
          width={488}
          height={680}
        />
      )}
    </a>
  );
}

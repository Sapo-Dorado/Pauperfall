import Image from 'next/image';
interface ImageURIs {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
}
interface CardData {
  id: string;
  name: string;
  image_uris?: ImageURIs;
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
  const { name, image_uris, scryfall_uri } = card;
  const href = scryfall_uri || `https://scryfall.com/search?q=${encodeURIComponent(name)}`;
  const imageUrl = getImageUri(image_uris);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      title={`View ${name} on Scryfall`}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={name}
          width={488}
          height={680}
        />
      )}
    </a>
  );
}

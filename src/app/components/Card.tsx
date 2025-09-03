interface CardData {
  id: string;
  name: string;
  image_uris?: {
    small: string;
  };
  mana_cost?: string;
  type_line?: string;
}

interface CardProps {
  card: CardData;
}

export default function Card({ card }: CardProps) {
  const { id, name, image_uris } = card;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {image_uris?.small && (
        <img
          src={image_uris.small}
          alt={name}
          className="w-full aspect-[2.5/3.5] object-cover"
        />
      )}
    </div>
  );
}

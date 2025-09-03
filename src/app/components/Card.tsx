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
  const { id, name, image_uris, mana_cost, type_line } = card;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {image_uris?.small && (
        <img
          src={image_uris.small}
          alt={name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-2">
          {name}
        </h3>
        {mana_cost && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
            Cost: {mana_cost}
          </p>
        )}
        {type_line && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {type_line}
          </p>
        )}
      </div>
    </div>
  );
}

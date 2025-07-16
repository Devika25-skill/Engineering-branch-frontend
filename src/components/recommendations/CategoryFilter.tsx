
interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryStats: {
    Dream: number;
    Reach: number;
    Match: number;
    Safety: number;
  };
}

export const CategoryFilter = ({ activeCategory, onCategoryChange, categoryStats }: CategoryFilterProps) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        {['All', 'Dream', 'Reach', 'Match', 'Safety'].map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === category
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {category}
            {category !== 'All' && (
              <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                {categoryStats[category as keyof typeof categoryStats]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

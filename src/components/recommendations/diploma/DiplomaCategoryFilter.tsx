import { Button } from "@/components/ui/button";

interface DiplomaCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  stats: {
    Dream: number;
    Reach: number;
    Match: number;
    Safety: number;
  };
}

export const DiplomaCategoryFilter = ({ 
  activeCategory, 
  onCategoryChange, 
  stats 
}: DiplomaCategoryFilterProps) => {
  const categories = [
    { 
      id: 'All', 
      label: 'All', 
      count: stats.Dream + stats.Reach + stats.Match + stats.Safety,
      color: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
    },
    { 
      id: 'Dream', 
      label: 'Dream', 
      count: stats.Dream,
      color: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
    },
    { 
      id: 'Reach', 
      label: 'Reach', 
      count: stats.Reach,
      color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
    },
    { 
      id: 'Match', 
      label: 'Match', 
      count: stats.Match,
      color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
    },
    { 
      id: 'Safety', 
      label: 'Safety', 
      count: stats.Safety,
      color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={`
            ${activeCategory === category.id 
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
              : category.color
            }
            font-medium text-sm px-3 py-1.5 h-auto
          `}
        >
          {category.label}
          {category.count > 0 && (
            <span className="ml-1.5 text-xs">
              ({category.count})
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search, X } from "lucide-react";

interface FilterDropdownProps {
  title: string;
  items: string[];
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
  searchPlaceholder?: string;
}

const FilterDropdown = ({
  title,
  items,
  selectedItems,
  onSelectionChange,
  searchPlaceholder = "Search..."
}: FilterDropdownProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleItem = (item: string, checked: boolean) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedItems, item];
    } else {
      newSelection = selectedItems.filter(i => i !== item);
    }
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const shouldShowSearch = items.length > 10;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between min-w-[180px] bg-white border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
        >
          <span className="flex items-center">
            {title}
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                {selectedItems.length}
              </Badge>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 max-h-96 bg-white border-2 border-purple-100 shadow-xl z-[200]"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="font-semibold">{title}</span>
          {selectedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Search Input - Only show if more than 10 items */}
        {shouldShowSearch && (
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm border-purple-200 focus:border-purple-400"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X size={12} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="max-h-48 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-2">
              No items found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <div key={item} className="flex items-center space-x-2 p-1 hover:bg-purple-50 rounded">
                  <Checkbox
                    id={`${title}-${item}`}
                    checked={selectedItems.includes(item)}
                    onCheckedChange={(checked) => handleToggleItem(item, checked as boolean)}
                  />
                  <Label
                    htmlFor={`${title}-${item}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;

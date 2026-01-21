import * as React from "react";
import { Check, ChevronsUpDown, Search, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const selectedOption = options.find((option) => option.value === value);

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          onClick={() => !disabled && setOpen(true)}
          disabled={disabled}
          className={cn(
            "justify-between h-12 rounded-xl border-2 bg-white hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left",
            className
          )}
        >
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
          {disabled ? (
            <Ban className="ml-2 h-4 w-4 shrink-0 text-red-500" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm mx-auto top-[10%] translate-y-0 flex flex-col p-0 max-h-[80vh]">
            <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
              <DialogTitle className="text-base font-medium">
                {placeholder}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              <Command className="h-full">
                <CommandInput
                  placeholder={searchPlaceholder}
                  className="h-10 border-0 border-b rounded-none focus:ring-0 px-4"
                />
                <CommandList className="h-full overflow-y-auto px-2">
                  <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                    No option found.
                  </CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onValueChange(
                            currentValue === value ? "" : currentValue
                          );
                          setOpen(false);
                        }}
                        className="cursor-pointer py-3 px-2 rounded-lg mx-1 my-0.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Check
                          className={cn(
                            "mr-3 h-4 w-4",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="text-sm">{option.label}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop version
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between h-12 rounded-xl border-2 bg-white hover:bg-accent hover:text-accent-foreground transition-colors w-full text-left",
            className
          )}
        >
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
          {disabled ? (
            <Ban className="ml-2 h-4 w-4 shrink-0 text-red-500" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 z-[100]"
        style={{ minWidth: "var(--radix-popover-trigger-width)" }}
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList className="max-h-80">
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

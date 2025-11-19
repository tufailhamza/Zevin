import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  maxDate,
  minDate,
  className,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState<string>(
    date ? format(date, "yyyy-MM-dd") : ""
  );
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputError, setInputError] = React.useState<string>("");

  // Update input value when date prop changes
  React.useEffect(() => {
    if (date) {
      setInputValue(format(date, "yyyy-MM-dd"));
      setInputError("");
    } else {
      setInputValue("");
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setInputError("");

    // Allow empty input
    if (!value.trim()) {
      onDateChange(undefined);
      return;
    }

    // Try to parse the date
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());

    if (!isValid(parsedDate)) {
      setInputError("Invalid date format (use YYYY-MM-DD)");
      return;
    }

    // Check max date
    if (maxDate && parsedDate > maxDate) {
      setInputError(`Date cannot be after ${format(maxDate, "yyyy-MM-dd")}`);
      return;
    }

    // Check min date
    if (minDate && parsedDate < minDate) {
      setInputError(`Date cannot be before ${format(minDate, "yyyy-MM-dd")}`);
      return;
    }

    onDateChange(parsedDate);
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Check max date
      if (maxDate && selectedDate > maxDate) {
        setInputError(`Date cannot be after ${format(maxDate, "yyyy-MM-dd")}`);
        return;
      }

      // Check min date
      if (minDate && selectedDate < minDate) {
        setInputError(`Date cannot be before ${format(minDate, "yyyy-MM-dd")}`);
        return;
      }

      setInputValue(format(selectedDate, "yyyy-MM-dd"));
      setInputError("");
      onDateChange(selectedDate);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    setInputError("");
    onDateChange(undefined);
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            "pr-20",
            inputError && "border-destructive focus-visible:ring-destructive"
          )}
          onFocus={(e) => {
            // Show placeholder format hint
            if (!e.target.value) {
              e.target.placeholder = "YYYY-MM-DD";
            }
          }}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.placeholder = placeholder;
            }
          }}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-muted"
                disabled={disabled}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleCalendarSelect}
                disabled={(date) => {
                  if (maxDate && date > maxDate) return true;
                  if (minDate && date < minDate) return true;
                  return false;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {inputError && (
        <p className="text-xs text-destructive">{inputError}</p>
      )}
      {!inputError && inputValue && date && (
        <p className="text-xs text-muted-foreground">
          {format(date, "EEEE, MMMM d, yyyy")}
        </p>
      )}
    </div>
  );
}



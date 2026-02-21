import * as React from "react";
import { cn } from "../lib/utils";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  return (
    <div className="relative" ref={ref}>
      {React.Children.map(children, (child) => {
        if (child?.type?.displayName === "SelectTrigger") {
          return React.cloneElement(child, { value, onValueChange, ...props });
        }
        if (child?.type?.displayName === "SelectContent") {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {isOpen && (
        <SelectContentWrapper onValueChange={onValueChange} value={value} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContentContext = React.createContext();

const SelectContentWrapper = ({ children, value, onValueChange, onClose }) => {
  return (
    <SelectContentContext.Provider value={{ value, onValueChange, onClose }}>
      {children}
    </SelectContentContext.Provider>
  );
};

const SelectContent = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const parentRef = React.useRef(null);

  // Find the trigger button and add click handler
  React.useEffect(() => {
    const parent = parentRef.current?.parentElement;
    const trigger = parent?.querySelector('[data-select-trigger]');
    if (trigger) {
      const handleClick = () => setIsOpen(!isOpen);
      trigger.addEventListener('click', handleClick);
      return () => trigger.removeEventListener('click', handleClick);
    }
  }, [isOpen]);

  return (
    <div ref={parentRef} className="relative">
      {isOpen && (
        <div
          ref={ref}
          className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-0 zoom-in-95 top-full mt-1",
            className
          )}
          {...props}
        >
          <div className="p-1">
            {React.Children.map(children, (child) => {
              if (child?.type?.displayName === "SelectItem") {
                return React.cloneElement(child, { 
                  currentValue: value, 
                  onSelect: (val) => {
                    onValueChange?.(val);
                    setIsOpen(false);
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(({ className, children, value, currentValue, onSelect, ...props }, ref) => {
  const isSelected = currentValue === value;
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        isSelected && "bg-gray-100 font-medium",
        className
      )}
      onClick={() => onSelect?.(value)}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = React.forwardRef(({ className, placeholder, ...props }, ref) => {
  return (
    <span ref={ref} className={cn("block truncate", className)} {...props}>
      {placeholder}
    </span>
  );
});
SelectValue.displayName = "SelectValue";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

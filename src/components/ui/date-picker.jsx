import * as React from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar1 } from "lucide-react"


export function DatePicker({ endIcon, noStartIcon, value, placeholder, onChange }) {
  const [date, setDate] = React.useState(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"theme"}
          className={cn("dark:bg-[#F0EDFFCC] bg-[#B2B0BDCC] w-full rounded-xl dark:text-black text-[16px] justify-start text-left font-normal px- py-6", !date && "text-muted-foreground", endIcon && "justify-between")}
        >
          {!noStartIcon && <Calendar1 className="mr-2 h-4 w-4" />}
          {date ? format(date, "PPP") : <span >{placeholder}</span>}
          {endIcon && <img src={endIcon} alt="endIcon" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className=" w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown-buttons"
          selected={date}
          onSelect={(date) => { setDate(date); onChange(date) }}
          fromYear={1960}
          toYear={2030}
        />
      </PopoverContent>
    </Popover>
  )
}
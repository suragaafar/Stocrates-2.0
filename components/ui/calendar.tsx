"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-semibold text-stocrates-dark dark:text-stocrates-cream",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 bg-transparent p-0 hover:bg-stocrates-blue/30 text-stocrates-dark dark:text-stocrates-cream"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex w-full justify-between mb-2",
        head_cell:
          "text-stocrates-dark/60 dark:text-stocrates-cream/60 w-10 font-medium text-sm flex items-center justify-center uppercase",
        row: "flex w-full justify-between mt-1",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-10 h-10",
        day: cn(
          "h-10 w-10 p-0 font-normal rounded-full hover:bg-stocrates-blue/30 hover:text-stocrates-dark dark:hover:text-stocrates-cream transition-colors flex items-center justify-center"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-stocrates-dark dark:bg-stocrates-blue text-stocrates-cream dark:text-stocrates-dark hover:bg-stocrates-dark hover:text-stocrates-cream dark:hover:bg-stocrates-blue dark:hover:text-stocrates-dark font-semibold",
        day_today: "bg-green-600 text-white font-bold hover:bg-green-700 hover:text-white",
        day_outside:
          "day-outside text-stocrates-dark/30 dark:text-stocrates-cream/30 opacity-50",
        day_disabled: "text-stocrates-dark/20 dark:text-stocrates-cream/20 opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-stocrates-blue/50 aria-selected:text-stocrates-dark",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }


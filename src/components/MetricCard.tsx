import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  tooltip?: string;
}

export const MetricCard = ({ title, value, tooltip }: MetricCardProps) => {
  return (
    <div className="border-2 border-dashed border-metric-border rounded-lg p-6 bg-card">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-sm text-muted-foreground text-center">{title}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="text-4xl font-bold text-center">{value}</div>
    </div>
  );
};

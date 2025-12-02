import { Chart } from "react-google-charts";
import { useSankeyData } from "@/hooks/use-api";

interface SankeyDiagramProps {
  sector: string;
}

// Convert API sankey data format to Google Charts format
// The API returns values as (15 - Total Score), so we reverse to get the original Total Score for tooltips
const convertSankeyData = (sankeyData: any, maxValue: number = 15) => {
  if (!sankeyData) return [["From", "To", "Weight", { role: 'tooltip', type: 'string' }]];

  const { node_list, source, target, value } = sankeyData;
  const chartData: any[] = [["From", "To", "Weight", { role: 'tooltip', type: 'string' }]];

  for (let i = 0; i < source.length; i++) {
    const fromNode = node_list[source[i]];
    const toNode = node_list[target[i]];
    const weight = value[i];
    // Calculate the original Total Score (reverse the 15-X transformation)
    const originalScore = maxValue - weight;
    const tooltip = `${fromNode} → ${toNode}\nTotal Score: ${originalScore.toFixed(2)}`;
    chartData.push([fromNode, toNode, weight, tooltip]);
  }

  return chartData;
};

export const SankeyDiagram = ({ sector }: SankeyDiagramProps) => {
  const { data: sankeyData, isLoading, error } = useSankeyData(sector, true, 15, !!sector);

  if (isLoading) {
    return (
      <div className="w-full bg-background rounded-lg border p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Sankey diagram...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-background rounded-lg border p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load Sankey diagram</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  const data = convertSankeyData(sankeyData, 15);
  const nodeColors = sankeyData?.node_colors || ["#2563eb", "#ea580c", "#16a34a", "#dc2626"];
  const levelColors = sankeyData?.level_colors || {
    sector: "#2563eb",
    harm_typology: "#ea580c",
    sdh_category: "#16a34a",
    sdh_indicator: "#dc2626",
  };

  const options = {
    sankey: {
      node: {
        colors: nodeColors,
        label: {
          fontName: "Arial",
          fontSize: 11,
          color: "#1f2937",
          bold: false,
        },
        nodePadding: 20,
        width: 8,
      },
      link: {
        colorMode: "gradient",
        colors: ["#94a3b8", "#cbd5e1"],
      },
    },
    tooltip: {
      textStyle: {
        fontSize: 12,
      },
    },
  };

  return (
    <div className="w-full bg-background rounded-lg border p-4">
      <div className="mb-4 flex items-center gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: levelColors.sector }}
          ></div>
          <span className="text-muted-foreground">Economic Sector (GICS)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: levelColors.harm_typology }}
          ></div>
          <span className="text-muted-foreground">Harm Typology</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: levelColors.sdh_category }}
          ></div>
          <span className="text-muted-foreground">SDH Category</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: levelColors.sdh_indicator }}
          ></div>
          <span className="text-muted-foreground">SDH Indicator</span>
        </div>
      </div>
      <Chart
        chartType="Sankey"
        width="100%"
        height="600px"
        data={data}
        options={options}
      />
    </div>
  );
};

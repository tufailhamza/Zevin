import { Chart } from "react-google-charts";
import { useSankeyData } from "@/hooks/use-api";

interface SankeyDiagramProps {
  sector: string;
}

// Convert API sankey data format to Google Charts format
// The API returns values as (15 - Total Score), so we reverse to get the original Total Score for tooltips
// Also returns the order in which nodes appear (needed for correct color assignment)
const convertSankeyData = (sankeyData: any, maxValue: number = 15): { chartData: any[], nodeAppearanceOrder: number[] } => {
  if (!sankeyData) return { 
    chartData: [["From", "To", "Weight", { role: 'tooltip', type: 'string' }]], 
    nodeAppearanceOrder: [] 
  };

  const { node_list, source, target, value } = sankeyData;
  const chartData: any[] = [["From", "To", "Weight", { role: 'tooltip', type: 'string' }]];
  
  // Track the order in which node INDICES appear in the data
  // Google Charts assigns colors based on this order
  const seenNodes = new Set<number>();
  const nodeAppearanceOrder: number[] = [];

  for (let i = 0; i < source.length; i++) {
    const srcIdx = source[i];
    const tgtIdx = target[i];
    const fromNode = node_list[srcIdx];
    const toNode = node_list[tgtIdx];
    const weight = value[i];
    
    // Track order of first appearance
    if (!seenNodes.has(srcIdx)) {
      seenNodes.add(srcIdx);
      nodeAppearanceOrder.push(srcIdx);
    }
    if (!seenNodes.has(tgtIdx)) {
      seenNodes.add(tgtIdx);
      nodeAppearanceOrder.push(tgtIdx);
    }
    
    // Calculate the original Total Score (reverse the 15-X transformation)
    const originalScore = maxValue - weight;
    const tooltip = `${fromNode} → ${toNode}\nTotal Score: ${originalScore.toFixed(2)}`;
    chartData.push([fromNode, toNode, weight, tooltip]);
  }

  return { chartData, nodeAppearanceOrder };
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

  const { chartData: data, nodeAppearanceOrder } = convertSankeyData(sankeyData, 15);
  
  // Define explicit colors for each level:
  // Sector (root/level 0) = Blue, Level 1 = Orange, Level 2 = Green, Level 3+ = Red
  const levelColors = {
    sector: "#2563eb",        // Blue (Level 0 - root)
    harm_typology: "#ea580c", // Orange (Level 1)
    sdh_category: "#16a34a",  // Green (Level 2)
    sdh_indicator: "#dc2626", // Red (Level 3+)
  };
  
  // Calculate node depths using BFS, then build colors array in appearance order
  const calculateNodeColors = (): string[] => {
    if (!sankeyData?.node_list || !sankeyData?.source || !sankeyData?.target) {
      return [levelColors.sector, levelColors.harm_typology, levelColors.sdh_category, levelColors.sdh_indicator];
    }
    
    const nodeCount = sankeyData.node_list.length;
    const depths: number[] = new Array(nodeCount).fill(-1);
    
    // Build adjacency list (source -> targets)
    const adjacency: number[][] = Array.from({ length: nodeCount }, () => []);
    for (let i = 0; i < sankeyData.source.length; i++) {
      const src = sankeyData.source[i];
      const tgt = sankeyData.target[i];
      adjacency[src].push(tgt);
    }
    
    // Find root nodes (nodes that appear as source but never as target)
    const targetSet = new Set<number>(sankeyData.target);
    const queue: number[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      if (!targetSet.has(i)) {
        depths[i] = 0; // Root node (Sector)
        queue.push(i);
      }
    }
    
    // BFS to calculate depths
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of adjacency[current]) {
        if (depths[neighbor] === -1) {
          depths[neighbor] = depths[current] + 1;
          queue.push(neighbor);
        }
      }
    }
    
    // Map depth to color function
    const depthToColor = (depth: number): string => {
      switch (depth) {
        case 0: return levelColors.sector;       // Blue - Sector (root)
        case 1: return levelColors.harm_typology; // Orange - Level 1
        case 2: return levelColors.sdh_category;  // Green - Level 2
        default: return levelColors.sdh_indicator; // Red - Level 3+
      }
    };
    
    // Build colors array in the ORDER nodes appear in chart data
    // This is critical - Google Charts assigns colors based on appearance order
    return nodeAppearanceOrder.map(nodeIdx => depthToColor(depths[nodeIdx]));
  };
  
  // Override API colors - always compute based on node level in appearance order
  const nodeColors = calculateNodeColors();

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
        height="1000px"
        data={data}
        options={options}
      />
    </div>
  );
};

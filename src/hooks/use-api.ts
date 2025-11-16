import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  StockInfoRequest,
  BondInfoRequest,
  StockInfoResponse,
  BondInfoResponse,
  PortfolioHarmScoresResponse,
} from "@/lib/api";

// React Query hooks for API calls

// Get Stock Information
export const useStockInfo = (data: StockInfoRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["stockInfo", data],
    queryFn: () => api.getStockInfo(data),
    enabled,
  });
};

// Get Bond Information
export const useBondInfo = (data: BondInfoRequest, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["bondInfo", data],
    queryFn: () => api.getBondInfo(data),
    enabled,
  });
};

// Calculate Stock Portfolio Harm Scores
export const useStockHarmScores = (stocks: StockInfoResponse[]) => {
  const stableKey = stocks.length > 0 
    ? stocks.map(s => `${s.stock}-${s.units}-${s.purchase_date}`).sort().join(",")
    : "empty";
  
  return useQuery({
    queryKey: ["stockHarmScores", stableKey],
    queryFn: async () => {
      console.log("Fetching stock harm scores for:", stocks);
      try {
        const result = await api.calculateStockHarmScores(stocks);
        console.log("Stock harm scores result:", result);
        return result;
      } catch (error) {
        console.error("Error calculating stock harm scores:", error);
        throw error;
      }
    },
    enabled: stocks.length > 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Calculate Bond Portfolio Harm Scores
export const useBondHarmScores = (bonds: BondInfoResponse[]) => {
  const stableKey = bonds.length > 0
    ? bonds.map(b => `${b.cusip}-${b.units}-${b.purchase_date}`).sort().join(",")
    : "empty";
  
  return useQuery({
    queryKey: ["bondHarmScores", stableKey],
    queryFn: async () => {
      console.log("Fetching bond harm scores for:", bonds);
      try {
        const result = await api.calculateBondHarmScores(bonds);
        console.log("Bond harm scores result:", result);
        return result;
      } catch (error) {
        console.error("Error calculating bond harm scores:", error);
        throw error;
      }
    },
    enabled: bonds.length > 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// Get Available Sectors
export const useSectors = () => {
  return useQuery({
    queryKey: ["sectors"],
    queryFn: () => api.getSectors(),
  });
};

// Get Sector Data
export const useSectorData = (sector: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["sectorData", sector],
    queryFn: () => api.getSectorData(sector),
    enabled: enabled && !!sector,
  });
};

// Get Sector Profile
export const useSectorProfile = (sector: string, enabled: boolean = true) => {
  const shouldEnable = enabled && !!sector;
  console.log("useSectorProfile called with:", { sector, enabled, shouldEnable });
  
  return useQuery({
    queryKey: ["sectorProfile", sector],
    queryFn: () => {
      console.log("useSectorProfile queryFn executing for sector:", sector);
      return api.getSectorProfile(sector);
    },
    enabled: shouldEnable,
    refetchOnWindowFocus: false,
  });
};

// Get Sankey Diagram Data
export const useSankeyData = (
  sector: string,
  subtractMax: boolean = true,
  maxValue: number = 15,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["sankeyData", sector, subtractMax, maxValue],
    queryFn: () => api.getSankeyData(sector, subtractMax, maxValue),
    enabled: enabled && !!sector,
  });
};

// Get Sector Info
export const useSectorInfo = (sector: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["sectorInfo", sector],
    queryFn: () => api.getSectorInfo(sector),
    enabled: enabled && !!sector,
  });
};

// Get Research Alerts
export const useResearchAlerts = () => {
  return useQuery({
    queryKey: ["researchAlerts"],
    queryFn: () => api.getResearchAlerts(),
  });
};

// Get Kataly Holdings
export const useKatalyHoldings = () => {
  return useQuery({
    queryKey: ["katalyHoldings"],
    queryFn: () => api.getKatalyHoldings(),
  });
};

// Mutations
export const useGeneratePDFReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sector,
      portfolioHarmScores,
    }: {
      sector: string;
      portfolioHarmScores: PortfolioHarmScoresResponse;
    }) => api.generatePDFReport(sector, portfolioHarmScores),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${variables.sector}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
};


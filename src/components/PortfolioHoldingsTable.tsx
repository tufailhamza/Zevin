import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockInfoResponse, BondInfoResponse } from "@/lib/api";

interface PortfolioHoldingsTableProps {
  holdings?: (StockInfoResponse | BondInfoResponse)[];
  type?: "stocks" | "bonds";
  allStockHoldings?: StockInfoResponse[];
  allBondHoldings?: BondInfoResponse[];
}

// Helper function to safely format numbers
const safeFormat = (value: number | null | undefined, decimals: number = 2, fallback: string = "0.00"): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
};

// Helper function to calculate total portfolio value
const calculateTotalPortfolioValue = (
  stockHoldings: StockInfoResponse[] = [],
  bondHoldings: BondInfoResponse[] = []
): number => {
  const stockTotal = stockHoldings.reduce((sum, stock) => {
    return sum + (stock.current_value ?? 0);
  }, 0);
  
  const bondTotal = bondHoldings.reduce((sum, bond) => {
    return sum + (bond.market_value ?? 0);
  }, 0);
  
  return stockTotal + bondTotal;
};

// Helper function to calculate weighted harm score for a holding
const calculateWeightedHarmScore = (
  weight: number,
  securityMeanScore: number
): number => {
  // Calculate Weighted Harm Score = (Weight / 100) × (100 - Security MEAN Score)
  // Weight is in percentage, so divide by 100 to convert to decimal (2.18% -> 0.0218)
  return (weight / 100) * (100 - securityMeanScore);
};

// Helper function to normalize API response to display format
const normalizeHolding = (
  holding: StockInfoResponse | BondInfoResponse,
  type: "stocks" | "bonds",
  totalPortfolioValue: number,
  portfolioHarmContribution: number
) => {
  if (type === "stocks") {
    const stock = holding as StockInfoResponse;
    // Use weight from API response directly (weight is in percentage, e.g., 2.18%)
    const portfolioAllocation = stock.weight ?? 0;
    const securityMeanScore = stock.security_mean_score ?? 0;
    const weightedHarmScore = calculateWeightedHarmScore(portfolioAllocation, securityMeanScore);
    
    return {
      identifier: stock.stock || "",
      units: stock.units || 0,
      purchaseDate: stock.purchase_date || "",
      currentPrice: stock.current_price ?? null,
      initialInvestment: stock.initial_investment ?? null,
      gainLoss: stock.gain_loss ?? null,
      gainLossPercent: stock.gain_loss_percentage ?? null,
      portfolioAllocation,
      sector: stock.sector || "",
      purchasePrice: stock.purchase_price ?? null,
      currentValue: stock.current_value ?? 0,
      weightedHarmScore,
      portfolioHarmContribution,
      sectorMeanScore: stock.sector_mean_score ?? null,
      securityTotalScore: stock.security_total_score ?? null,
      securityMeanScore,
    };
  } else {
    const bond = holding as BondInfoResponse;
    // Use weight from API response directly (weight is in percentage, e.g., 2.18%)
    const portfolioAllocation = bond.weight ?? 0;
    const securityMeanScore = bond.security_mean_score ?? 0;
    const weightedHarmScore = calculateWeightedHarmScore(portfolioAllocation, securityMeanScore);
    
    return {
      identifier: bond.cusip || "",
      units: bond.units || 0,
      purchaseDate: bond.purchase_date || "",
      currentPrice: bond.current_price ?? null,
      initialInvestment: bond.total_cost ?? null,
      gainLoss: bond.total_return ?? null,
      gainLossPercent: bond.total_cost && bond.total_cost > 0 
        ? ((bond.total_return ?? 0) / bond.total_cost) * 100 
        : 0,
      portfolioAllocation,
      sector: bond.industry_group || "",
      purchasePrice: bond.purchase_price ?? null,
      currentValue: bond.market_value ?? 0,
      weightedHarmScore,
      portfolioHarmContribution,
      sectorMeanScore: bond.sector_mean_score ?? null,
      securityTotalScore: bond.security_total_score ?? null,
      securityMeanScore,
    };
  }
};

export const PortfolioHoldingsTable = ({ 
  holdings = [], 
  type = "stocks",
  allStockHoldings = [],
  allBondHoldings = []
}: PortfolioHoldingsTableProps) => {
  if (!holdings || holdings.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No holdings to display</p>
      </div>
    );
  }

  // Calculate total portfolio value (stocks + bonds combined)
  const totalPortfolioValue = calculateTotalPortfolioValue(allStockHoldings, allBondHoldings);
  
  // Calculate Total Harm = SUM(Weighted Harm) across all holdings (stocks + bonds)
  const totalHarm = [
    ...allStockHoldings.map(stock => 
      calculateWeightedHarmScore(stock.weight ?? 0, stock.security_mean_score ?? 0)
    ),
    ...allBondHoldings.map(bond => 
      calculateWeightedHarmScore(bond.weight ?? 0, bond.security_mean_score ?? 0)
    )
  ].reduce((sum, score) => sum + score, 0);
  
  // Normalize holdings and calculate Portfolio Harm Contribution for each
  const normalizedHoldings = holdings.map((h) => {
    const weight = h.weight ?? 0;
    const securityMeanScore = 'security_mean_score' in h ? (h.security_mean_score ?? 0) : 0;
    const weightedHarmScore = calculateWeightedHarmScore(weight, securityMeanScore);
    
    // Calculate Portfolio Harm Contribution = (Weighted Harm / Total Harm) × 100
    const portfolioHarmContribution = totalHarm > 0 
      ? (weightedHarmScore / totalHarm) * 100 
      : 0;
    
    return normalizeHolding(h, type, totalPortfolioValue, portfolioHarmContribution);
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              <TableHead className="font-medium text-foreground">#</TableHead>
              <TableHead className="font-medium text-foreground">{type === "stocks" ? "Stock" : "CUSIP"}</TableHead>
              <TableHead className="font-medium text-foreground">Weight (%)</TableHead>
              <TableHead className="font-medium text-foreground">Current Price</TableHead>
              <TableHead className="font-medium text-foreground">{type === "stocks" ? "Sector" : "Industry Group"}</TableHead>
              <TableHead className="font-medium text-foreground">Weighted Harm Score</TableHead>
              <TableHead className="font-medium text-foreground">Sector Mean Score</TableHead>
              <TableHead className="font-medium text-foreground">Portfolio Harm Contribution</TableHead>
              <TableHead className="font-medium text-foreground">Security Mean Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {normalizedHoldings.map((holding, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{holding.identifier}</TableCell>
                <TableCell>{safeFormat(holding.portfolioAllocation)}%</TableCell>
                <TableCell>
                  {holding.currentPrice !== null && holding.currentPrice !== undefined
                    ? `$${safeFormat(holding.currentPrice, 2)}`
                    : "N/A"}
                </TableCell>
                <TableCell>{holding.sector}</TableCell>
                <TableCell>{safeFormat(holding.weightedHarmScore)}</TableCell>
                <TableCell>{safeFormat(holding.sectorMeanScore)}</TableCell>
                <TableCell>{safeFormat(holding.portfolioHarmContribution)}%</TableCell>
                <TableCell>{safeFormat(holding.securityMeanScore)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

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

// Helper function to normalize API response to display format
const normalizeHolding = (
  holding: StockInfoResponse | BondInfoResponse,
  type: "stocks" | "bonds",
  totalPortfolioValue: number
) => {
  if (type === "stocks") {
    const stock = holding as StockInfoResponse;
    const currentValue = stock.current_value ?? 0;
    const portfolioAllocation = totalPortfolioValue > 0 
      ? (currentValue / totalPortfolioValue) * 100 
      : 0;
    
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
      currentValue,
      sectorTotalScore: stock.sector_total_score ?? null,
      sectorMeanScore: stock.sector_mean_score ?? null,
      securityTotalScore: stock.security_total_score ?? null,
      securityMeanScore: stock.security_mean_score ?? null,
    };
  } else {
    const bond = holding as BondInfoResponse;
    const totalReturn = bond.total_return ?? 0;
    const totalCost = bond.total_cost ?? 1;
    const currentValue = bond.market_value ?? 0;
    const portfolioAllocation = totalPortfolioValue > 0 
      ? (currentValue / totalPortfolioValue) * 100 
      : 0;
    
    return {
      identifier: bond.cusip || "",
      units: bond.units || 0,
      purchaseDate: bond.purchase_date || "",
      currentPrice: bond.current_price ?? null,
      initialInvestment: totalCost,
      gainLoss: totalReturn,
      gainLossPercent: totalCost > 0 ? (totalReturn / totalCost) * 100 : 0,
      portfolioAllocation,
      sector: bond.industry_group || "",
      purchasePrice: bond.purchase_price ?? null,
      currentValue,
      sectorTotalScore: bond.sector_total_score ?? null,
      sectorMeanScore: bond.sector_mean_score ?? null,
      securityTotalScore: bond.security_total_score ?? null,
      securityMeanScore: bond.security_mean_score ?? null,
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
  
  const normalizedHoldings = holdings.map((h) => normalizeHolding(h, type, totalPortfolioValue));

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              <TableHead className="font-medium text-foreground">#</TableHead>
              <TableHead className="font-medium text-foreground">{type === "stocks" ? "Stock" : "CUSIP"}</TableHead>
              <TableHead className="font-medium text-foreground">Units</TableHead>
              <TableHead className="font-medium text-foreground">Purchase Date</TableHead>
              <TableHead className="font-medium text-foreground">Current Price ($)</TableHead>
              <TableHead className="font-medium text-foreground">Initial Investment ($)</TableHead>
              <TableHead className="font-medium text-foreground">Gain/Loss ($)</TableHead>
              <TableHead className="font-medium text-foreground">Gain/Loss (%)</TableHead>
              <TableHead className="font-medium text-foreground">Portfolio Allocation</TableHead>
              <TableHead className="font-medium text-foreground">{type === "stocks" ? "Sector" : "Industry Group"}</TableHead>
              <TableHead className="font-medium text-foreground">Purchase Price ($)</TableHead>
              <TableHead className="font-medium text-foreground">Current Value ($)</TableHead>
              <TableHead className="font-medium text-foreground">Sector Total Score</TableHead>
              <TableHead className="font-medium text-foreground">Sector Mean Score</TableHead>
              <TableHead className="font-medium text-foreground">Security Total Score</TableHead>
              <TableHead className="font-medium text-foreground">Security Mean Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {normalizedHoldings.map((holding, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{holding.identifier}</TableCell>
                <TableCell>{holding.units}</TableCell>
                <TableCell>{holding.purchaseDate}</TableCell>
                <TableCell>{safeFormat(holding.currentPrice)}</TableCell>
                <TableCell>{safeFormat(holding.initialInvestment)}</TableCell>
                <TableCell className={(holding.gainLoss ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                  {safeFormat(holding.gainLoss)}
                </TableCell>
                <TableCell className={(holding.gainLossPercent ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                  {safeFormat(holding.gainLossPercent)}%
                </TableCell>
                <TableCell>{safeFormat(holding.portfolioAllocation)}%</TableCell>
                <TableCell>{holding.sector}</TableCell>
                <TableCell>{safeFormat(holding.purchasePrice)}</TableCell>
                <TableCell>{safeFormat(holding.currentValue)}</TableCell>
                <TableCell>{safeFormat(holding.sectorTotalScore)}</TableCell>
                <TableCell>{safeFormat(holding.sectorMeanScore)}</TableCell>
                <TableCell>{safeFormat(holding.securityTotalScore)}</TableCell>
                <TableCell>{safeFormat(holding.securityMeanScore)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

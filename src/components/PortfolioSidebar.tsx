import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import zevinLogo from "@/assets/zevin-logo.png";
import { api, StockInfoResponse, BondInfoResponse } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface PortfolioSidebarProps {
  onStockAdded?: (stock: StockInfoResponse) => void;
  onBondAdded?: (bond: BondInfoResponse) => void;
  onStockRemoved?: (index: number) => void;
  onBondRemoved?: (index: number) => void;
  stockHoldings?: StockInfoResponse[];
  bondHoldings?: BondInfoResponse[];
}

export const PortfolioSidebar = ({
  onStockAdded,
  onBondAdded,
  onStockRemoved,
  onBondRemoved,
  stockHoldings = [],
  bondHoldings = [],
}: PortfolioSidebarProps) => {
  const [ticker, setTicker] = useState("");
  const [stockWeight, setStockWeight] = useState("");
  const [cusip, setCusip] = useState("");
  const [bondWeight, setBondWeight] = useState("");
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [isAddingBond, setIsAddingBond] = useState(false);
  const [selectedStockIndex, setSelectedStockIndex] = useState<string>("");
  const [selectedBondIndex, setSelectedBondIndex] = useState<string>("");

  const handleAddStock = async () => {
    if (!ticker || !stockWeight) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const weightPercent = parseFloat(stockWeight);
    if (isNaN(weightPercent) || weightPercent <= 0 || weightPercent > 100) {
      toast({
        title: "Error",
        description: "Weight must be a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    setIsAddingStock(true);
    try {
      const stockData = await api.getStockInfo({
        ticker: ticker.trim(),
        weight: weightPercent,
      });

      console.log("Stock data received:", stockData);

      if (onStockAdded) {
        onStockAdded(stockData);
        console.log("Stock added callback called");
      }

      // Reset form
      setTicker("");
      setStockWeight("");

      toast({
        title: "Success",
        description: `Added ${stockData.stock} to portfolio`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add stock",
        variant: "destructive",
      });
    } finally {
      setIsAddingStock(false);
    }
  };

  const handleAddBond = async () => {
    if (!cusip || !bondWeight) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const weightPercent = parseFloat(bondWeight);
    if (isNaN(weightPercent) || weightPercent <= 0 || weightPercent > 100) {
      toast({
        title: "Error",
        description: "Weight must be a number between 0 and 100",
        variant: "destructive",
      });
      return;
    }

    setIsAddingBond(true);
    try {
      const bondData = await api.getBondInfo({
        cusip: cusip.trim(),
        weight: weightPercent,
      });

      if (onBondAdded) {
        onBondAdded(bondData);
      }

      // Reset form
      setCusip("");
      setBondWeight("");

      toast({
        title: "Success",
        description: `Added bond ${bondData.cusip} to portfolio`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add bond",
        variant: "destructive",
      });
    } finally {
      setIsAddingBond(false);
    }
  };

  return (
    <div className="bg-sidebar-bg">
      <div className="p-6 border-b border-sidebar-border">
        <img 
          src={zevinLogo} 
          alt="Zevin Asset Management" 
          className="w-full h-auto max-w-[240px]"
        />
      </div>

      <div className="p-4 space-y-6">
        {/* Add Stock Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Add Stock to Portfolio</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="ticker" className="text-xs text-muted-foreground">Enter a stock ticker</Label>
              <Input 
                id="ticker" 
                placeholder="AAPL" 
                className="mt-1"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="weight" className="text-xs text-muted-foreground">Enter weight (%)</Label>
              <Input 
                id="weight" 
                type="number" 
                value={stockWeight}
                onChange={(e) => setStockWeight(e.target.value)}
                placeholder="10.5" 
                step="0.1"
                min="0"
                max="100"
                className="mt-1" 
              />
              <p className="text-xs text-muted-foreground mt-1">Portfolio weight as a percentage</p>
            </div>
            <Button 
              className="w-full"
              onClick={handleAddStock}
              disabled={isAddingStock || !ticker || !stockWeight}
            >
              {isAddingStock ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </div>

        {/* Remove Stocks Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Remove Stocks from Portfolio</h3>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Select stocks to remove</Label>
              <Select 
                value={selectedStockIndex}
                onValueChange={(value) => {
                  setSelectedStockIndex(value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select stock to remove" />
                </SelectTrigger>
                <SelectContent>
                  {stockHoldings.length === 0 ? (
                    <SelectItem value="none" disabled>No stocks available</SelectItem>
                  ) : (
                    stockHoldings.map((stock, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {stock.stock} - {stock.weight?.toFixed(2) || "0.00"}%
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              disabled={stockHoldings.length === 0 || !selectedStockIndex || selectedStockIndex === "none"}
              onClick={() => {
                if (selectedStockIndex && selectedStockIndex !== "none" && onStockRemoved) {
                  const index = parseInt(selectedStockIndex);
                  const stock = stockHoldings[index];
                  onStockRemoved(index);
                  setSelectedStockIndex("");
                  toast({
                    title: "Success",
                    description: `Removed ${stock?.stock || "stock"} from portfolio`,
                  });
                }
              }}
            >
              Remove Selected Stock
            </Button>
          </div>
        </div>

        {/* Add Bond Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Add Bond by CUSIP</h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="cusip" className="text-xs text-muted-foreground">Enter 9-character CUSIP</Label>
              <Input 
                id="cusip" 
                placeholder="910047AG4" 
                className="mt-1"
                value={cusip}
                onChange={(e) => setCusip(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="bond-weight" className="text-xs text-muted-foreground">Enter weight (%)</Label>
              <Input 
                id="bond-weight" 
                type="number" 
                value={bondWeight}
                onChange={(e) => setBondWeight(e.target.value)}
                placeholder="10.5" 
                step="0.1"
                min="0"
                max="100"
                className="mt-1" 
              />
              <p className="text-xs text-muted-foreground mt-1">Portfolio weight as a percentage</p>
            </div>
            <Button 
              className="w-full"
              onClick={handleAddBond}
              disabled={isAddingBond || !cusip || !bondWeight}
            >
              {isAddingBond ? "Adding..." : "Add Bond"}
            </Button>
          </div>
        </div>

        {/* Remove Security Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Remove Security from Portfolio</h3>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Select Security to remove</Label>
              <Select 
                value={selectedBondIndex}
                onValueChange={(value) => {
                  setSelectedBondIndex(value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select security to remove" />
                </SelectTrigger>
                <SelectContent>
                  {bondHoldings.length === 0 ? (
                    <SelectItem value="none" disabled>No securities available</SelectItem>
                  ) : (
                    bondHoldings.map((bond, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {bond.cusip} - {bond.weight?.toFixed(2) || "0.00"}%
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              disabled={bondHoldings.length === 0 || !selectedBondIndex || selectedBondIndex === "none"}
              onClick={() => {
                if (selectedBondIndex && selectedBondIndex !== "none" && onBondRemoved) {
                  const index = parseInt(selectedBondIndex);
                  const bond = bondHoldings[index];
                  onBondRemoved(index);
                  setSelectedBondIndex("");
                  toast({
                    title: "Success",
                    description: `Removed bond ${bond?.cusip || "security"} from portfolio`,
                  });
                }
              }}
            >
              Remove Selected Bond
            </Button>
          </div>
        </div>

        {/* Download Report */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Download Report</h3>
          <Button variant="outline" className="w-full">Download Report</Button>
        </div>
      </div>
    </div>
  );
};

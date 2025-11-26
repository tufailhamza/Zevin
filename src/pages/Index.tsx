import { PortfolioSidebar } from "@/components/PortfolioSidebar";
import { MetricCard } from "@/components/MetricCard";
import { ResearchAlertTable } from "@/components/ResearchAlertTable";
import { PortfolioHoldingsTable } from "@/components/PortfolioHoldingsTable";
import { SankeyDiagram } from "@/components/SankeyDiagram";
import { SectorEquityProfileTable } from "@/components/SectorEquityProfileTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import mammoth from "mammoth";
import { useSectors, useStockHarmScores, useBondHarmScores } from "@/hooks/use-api";
import { StockInfoResponse, BondInfoResponse, api } from "@/lib/api";

const Index = () => {
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const [isLoadingDisclaimer, setIsLoadingDisclaimer] = useState<boolean>(false);
  const [disclaimerError, setDisclaimerError] = useState<string>("");
  
  // Initial tickers data for batch loading
  const initialTickers = [
    { ticker: "GOOG", weight: 2.18 },
    { ticker: "GOOGL", weight: 1.51 },
    { ticker: "AMZN", weight: 2.63 },
    { ticker: "HD", weight: 0.86 },
    { ticker: "MELI", weight: 4.49 },
    { ticker: "TJX", weight: 2.66 },
    { ticker: "CL", weight: 1.24 },
    { ticker: "COST", weight: 2.85 },
    { ticker: "KR", weight: 1.44 },
    { ticker: "AON", weight: 1.32 },
    { ticker: "CB", weight: 1.50 },
    { ticker: "PNC", weight: 0.77 },
    { ticker: "SPGI", weight: 0.82 },
    { ticker: "V", weight: 3.61 },
    { ticker: "ABBV", weight: 1.64 },
    { ticker: "AZN", weight: 1.16 },
    { ticker: "DHR", weight: 1.25 },
    { ticker: "LLY", weight: 1.01 },
    { ticker: "NVS", weight: 1.24 },
    { ticker: "ADP", weight: 3.29 },
    { ticker: "EMR", weight: 1.81 },
    { ticker: "EXPD", weight: 0.19 },
    { ticker: "TRU", weight: 1.01 },
    { ticker: "UPS", weight: 0.02 },
    { ticker: "AAPL", weight: 3.09 },
    { ticker: "ACN", weight: 1.06 },
    { ticker: "ADI", weight: 1.57 },
    { ticker: "ASML", weight: 1.28 },
    { ticker: "CRWD", weight: 1.65 },
    { ticker: "DDOG", weight: 0.90 },
    { ticker: "MSFT", weight: 3.64 },
    { ticker: "NVDA", weight: 1.89 },
    { ticker: "ECL", weight: 2.02 },
    { ticker: "LIN", weight: 1.95 },
    { ticker: "DLR", weight: 1.47 },
  ];
  
  // Holdings state - initialized as empty, will be populated from batch endpoint
  const [stockHoldings, setStockHoldings] = useState<StockInfoResponse[]>([]);
  const [bondHoldings, setBondHoldings] = useState<BondInfoResponse[]>([]);
  const [isLoadingInitialStocks, setIsLoadingInitialStocks] = useState<boolean>(true);
  
  // Get sectors from API
  const { data: sectors = [], isLoading: isLoadingSectors, error: sectorsError } = useSectors();
  
  // Load initial stocks from batch endpoint
  useEffect(() => {
    const loadInitialStocks = async () => {
      setIsLoadingInitialStocks(true);
      try {
        const stocks = await api.getBatchStockInfo({ tickers: initialTickers });
        setStockHoldings(stocks);
      } catch (error) {
        console.error("Failed to load initial stocks:", error);
        // Fallback to empty array on error
        setStockHoldings([]);
      } finally {
        setIsLoadingInitialStocks(false);
      }
    };
    
    loadInitialStocks();
  }, []);
  
  // Calculate harm scores from API - automatically recalculates when stockHoldings changes
  const { data: apiStockHarmScores, isLoading: isLoadingStockScores, error: stockScoresError } = useStockHarmScores(stockHoldings);
  
  // Use API scores
  const stockHarmScores = apiStockHarmScores || {
    average_score: 0,
    total_score: 0,
    quartile: "N/A"
  };

  // Debug: Log when harm scores are recalculated
  useEffect(() => {
    if (stockHoldings.length > 0) {
      console.log("Stock holdings changed, harm scores will be recalculated:", stockHoldings.length, "stocks");
      console.log("Current harm scores:", apiStockHarmScores);
    }
  }, [stockHoldings, apiStockHarmScores]);
  
  // Debug sectors
  useEffect(() => {
    console.log("Sectors data:", sectors);
    console.log("Sectors loading:", isLoadingSectors);
    console.log("Sectors error:", sectorsError);
  }, [sectors, isLoadingSectors, sectorsError]);
  
  // Calculate harm scores (bonds still use API, stocks are hardcoded)
  const { data: bondHarmScores, isLoading: isLoadingBondScores, error: bondScoresError } = useBondHarmScores(bondHoldings);

  // Debug logging
  useEffect(() => {
    console.log("Bond holdings updated:", bondHoldings);
    console.log("Bond harm scores:", bondHarmScores);
    console.log("Bond scores loading:", isLoadingBondScores);
    console.log("Bond scores error:", bondScoresError);
  }, [bondHoldings, bondHarmScores, isLoadingBondScores, bondScoresError]);

  useEffect(() => {
    const loadDisclaimer = async () => {
      setIsLoadingDisclaimer(true);
      setDisclaimerError("");
      try {
        const response = await fetch("/RFL-Disclaimer.docx");
        if (!response.ok) {
          throw new Error("Failed to load disclaimer document");
        }
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setDisclaimerText(result.value);
      } catch (error) {
        console.error("Error loading disclaimer:", error);
        setDisclaimerError("Failed to load disclaimer document. Please try downloading it instead.");
      } finally {
        setIsLoadingDisclaimer(false);
      }
    };

    loadDisclaimer();
  }, []);
  return (
    <div className="flex h-screen bg-background">
      <ScrollArea className="w-80 border-r">
        <PortfolioSidebar
          onStockAdded={(stock) => {
            console.log("Stock added with data:", stock);
            console.log("Current price:", stock.current_price);
            setStockHoldings((prev) => {
              const updated = [...prev, stock];
              console.log("Updated stock holdings:", updated);
              return updated;
            });
          }}
          onBondAdded={(bond) => {
            setBondHoldings((prev) => [...prev, bond]);
          }}
          onStockRemoved={(index) => {
            setStockHoldings((prev) => prev.filter((_, i) => i !== index));
          }}
          onBondRemoved={(index) => {
            setBondHoldings((prev) => prev.filter((_, i) => i !== index));
          }}
          stockHoldings={stockHoldings}
          bondHoldings={bondHoldings}
        />
      </ScrollArea>
      
      <ScrollArea className="flex-1">
        <main className="max-w-7xl mx-auto p-8 space-y-8">
          {/* Header */}
          <header>
            <h1 className="text-4xl font-bold text-foreground">Corporate Racial Justice Intelligence Canvas</h1>
          </header>

          {/* Portfolio Holdings Summary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2">Portfolio Holdings Summary</h2>
            {isLoadingInitialStocks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading initial portfolio data...</p>
              </div>
            ) : (
              <PortfolioHoldingsTable 
                holdings={stockHoldings} 
                type="stocks"
                allStockHoldings={stockHoldings}
                allBondHoldings={bondHoldings}
              />
            )}
          </section>

          {/* Portfolio Racial Equity Summary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2">Portfolio Racial Equity Summary</h2>
            <div className="mt-6">
                {isLoadingStockScores ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Calculating stock portfolio harm scores...</p>
                  </div>
                ) : stockScoresError ? (
                  <div className="text-center py-8 border rounded-lg bg-destructive/10">
                    <p className="text-destructive font-semibold mb-2">Error calculating scores</p>
                    <p className="text-sm text-muted-foreground">
                      {stockScoresError instanceof Error 
                        ? stockScoresError.message 
                        : String(stockScoresError) || "Failed to calculate stock harm scores"}
                    </p>
                  </div>
                ) : stockHoldings.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">Add stocks to your portfolio to see harm scores</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <MetricCard 
                        title="Average Portfolio Harm Score" 
                        value={
                          stockHarmScores?.average_score != null 
                            ? stockHarmScores.average_score.toFixed(2) 
                            : "0.0"
                        }
                        tooltip="This score represents a portfolio level weighted average based on the number of units for each security. The score is based on a scale of 1-100, where 1 is the score for the highest harm sector and 100 is the score for the lowest harm sector."
                      />
                      <MetricCard 
                        title="Total Portfolio Harm Quartile" 
                        value={stockHarmScores?.quartile || "N/A"}
                        tooltip="This score shows where the portfolio sits relative to other potential portfolio compositions. Portfolios in the first quartile (highest harm) range from 1.00-38.80, the second quartile (moderate-high harm) ranges from 38.81 to 50.00, the third quartile (moderate low) ranges from 50.01-82.40 and the fourth quartile (lowest harm) ranges from 82.41-100.00."
                      />
                    </div>
                    
                  </div>
                )}
            </div>
          </section>

          {/* Corporate Racial Equity Canvas */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2">Corporate Racial Equity Canvas</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Select a sector for the Sankey diagram</Label>
                <Select 
                  value={selectedSector} 
                  onValueChange={setSelectedSector}
                  disabled={isLoadingSectors}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingSectors ? "Loading sectors..." : "Select sector"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorsError ? (
                      <SelectItem value="error" disabled>
                        Error loading sectors
                      </SelectItem>
                    ) : sectors.length === 0 && !isLoadingSectors ? (
                      <SelectItem value="empty" disabled>
                        No sectors available
                      </SelectItem>
                    ) : (
                      sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSector && (
                <div className="space-y-4">
                  <div className="text-sm text-primary font-medium p-3 bg-accent/10 rounded-lg">
                    Corporate Racial Equity Canvas for {selectedSector} Sector
                  </div>
                  <SankeyDiagram sector={selectedSector} />
                  
                  {/* Detailed Sector Equity Profile Table */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Detailed {selectedSector} Sector Equity Profile
                    </h3>
                    <SectorEquityProfileTable sector={selectedSector} />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* New Racial Justice Research Alert */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2">New Racial Justice Research Alert</h2>
            <ResearchAlertTable />
          </section>

          {/* Legal Disclaimer and Score Methodology */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2">Legal Disclaimer and Score Methodology</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="disclaimer">
                <AccordionTrigger className="text-left font-semibold">Legal Disclaimer</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">Legal Disclaimer Document</h4>
                          <p className="text-sm text-muted-foreground">Complete legal disclaimer document</p>
                        </div>
                        <a 
                          href="/RFL-Disclaimer.docx" 
                          download 
                          className="text-primary hover:underline text-sm font-medium px-4 py-2 border border-primary rounded-md hover:bg-primary/10 transition-colors"
                        >
                          Download DOCX
                        </a>
                      </div>
                    </div>
                    <div className="p-6 bg-background">
                      {isLoadingDisclaimer ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm text-muted-foreground">Loading document...</p>
                          </div>
                        </div>
                      ) : disclaimerError ? (
                        <div className="text-center py-8 space-y-4">
                          <p className="text-destructive">{disclaimerError}</p>
                          <a 
                            href="/RFL-Disclaimer.docx" 
                            download 
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            Download the document instead
                          </a>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none text-foreground">
                          <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {disclaimerText || "No content available"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="methodology">
                <AccordionTrigger className="text-left font-semibold">Score Methodology</AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-2 border-b flex items-center justify-between">
                      <span className="text-sm font-medium">Corporate Racial Equity Score - Methodology Statement</span>
                      <a 
                        href="/Methodology-Statement.pdf" 
                        download 
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Download PDF
                      </a>
                    </div>
                    <iframe
                      src="/Methodology-Statement.pdf"
                      className="w-full h-[600px] border-0"
                      title="Score Methodology PDF"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </main>
      </ScrollArea>
    </div>
  );
};

export default Index;

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
import { StockInfoResponse, BondInfoResponse } from "@/lib/api";

const Index = () => {
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [disclaimerText, setDisclaimerText] = useState<string>("");
  const [isLoadingDisclaimer, setIsLoadingDisclaimer] = useState<boolean>(false);
  const [disclaimerError, setDisclaimerError] = useState<string>("");
  
  // Holdings state - in a real app, this would come from user input or saved data
  const [stockHoldings, setStockHoldings] = useState<StockInfoResponse[]>([]);
  const [bondHoldings, setBondHoldings] = useState<BondInfoResponse[]>([]);
  
  // Get sectors from API
  const { data: sectors = [], isLoading: isLoadingSectors, error: sectorsError } = useSectors();
  
  // Debug sectors
  useEffect(() => {
    console.log("Sectors data:", sectors);
    console.log("Sectors loading:", isLoadingSectors);
    console.log("Sectors error:", sectorsError);
  }, [sectors, isLoadingSectors, sectorsError]);
  
  // Calculate harm scores
  const { data: stockHarmScores, isLoading: isLoadingStockScores, error: stockScoresError } = useStockHarmScores(stockHoldings);
  const { data: bondHarmScores, isLoading: isLoadingBondScores, error: bondScoresError } = useBondHarmScores(bondHoldings);

  // Debug logging
  useEffect(() => {
    console.log("Stock holdings updated:", stockHoldings);
    console.log("Stock harm scores:", stockHarmScores);
    console.log("Stock scores loading:", isLoadingStockScores);
    console.log("Stock scores error:", stockScoresError);
  }, [stockHoldings, stockHarmScores, isLoadingStockScores, stockScoresError]);

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
            setStockHoldings((prev) => [...prev, stock]);
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
            <Tabs defaultValue="stocks" className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
                <TabsTrigger 
                  value="bond" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none data-[state=active]:text-accent"
                >
                  Bond Portfolio
                </TabsTrigger>
                <TabsTrigger 
                  value="stocks"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none"
                >
                  Stocks
                </TabsTrigger>
              </TabsList>
              <TabsContent value="bond" className="mt-4">
                <PortfolioHoldingsTable 
                  holdings={bondHoldings} 
                  type="bonds"
                  allStockHoldings={stockHoldings}
                  allBondHoldings={bondHoldings}
                />
              </TabsContent>
              <TabsContent value="stocks" className="mt-4">
                <PortfolioHoldingsTable 
                  holdings={stockHoldings} 
                  type="stocks"
                  allStockHoldings={stockHoldings}
                  allBondHoldings={bondHoldings}
                />
              </TabsContent>
            </Tabs>
          </section>

          {/* Portfolio Racial Equity Summary */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold border-b-2 border-primary pb-2">Portfolio Racial Equity Summary</h2>
            <Tabs defaultValue="stock-scores" className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
                <TabsTrigger 
                  value="bond-scores" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none data-[state=active]:text-accent"
                >
                  Bond Portfolio Harm Scores
                </TabsTrigger>
                <TabsTrigger 
                  value="stock-scores"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent rounded-none"
                >
                  Stock Portfolio Harm Scores
                </TabsTrigger>
              </TabsList>
              <TabsContent value="bond-scores" className="mt-6">
                {isLoadingBondScores ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Calculating bond portfolio harm scores...</p>
                  </div>
                ) : bondScoresError ? (
                  <div className="text-center py-8 border rounded-lg bg-destructive/10">
                    <p className="text-destructive font-semibold mb-2">Error calculating scores</p>
                    <p className="text-sm text-muted-foreground">
                      {bondScoresError instanceof Error 
                        ? bondScoresError.message 
                        : String(bondScoresError) || "Failed to calculate bond harm scores"}
                    </p>
                  </div>
                ) : bondHoldings.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">Add bonds to your portfolio to see harm scores</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <MetricCard 
                        title="Average Portfolio Harm Score" 
                        value={
                          bondHarmScores?.average_score != null 
                            ? bondHarmScores.average_score.toFixed(2) 
                            : "0.0"
                        }
                        tooltip="Average harm score across all holdings"
                      />
                      <MetricCard 
                        title="Total Portfolio Harm Quartile" 
                        value={bondHarmScores?.quartile || "N/A"}
                        tooltip="Quartile ranking of portfolio harm"
                      />
                    </div>
                    {import.meta.env.DEV && bondHarmScores && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                        Debug: {JSON.stringify(bondHarmScores, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="stock-scores" className="mt-6">
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
                        tooltip="Average harm score across all holdings"
                      />
                      <MetricCard 
                        title="Total Portfolio Harm Quartile" 
                        value={stockHarmScores?.quartile || "N/A"}
                        tooltip="Quartile ranking of portfolio harm"
                      />
                    </div>
                    {import.meta.env.DEV && stockHarmScores && (
                      <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                        Debug: {JSON.stringify(stockHarmScores, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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

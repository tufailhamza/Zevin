// API Base URL - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://zevin-backend-ijou.vercel.app";

// Types
export interface StockInfoRequest {
  ticker: string;
  weight: number;
}

export interface StockInfoResponse {
  stock: string;
  weight: number;
  sector: string;
  sector_total_score: number;
  sector_mean_score: number;
  security_total_score: number;
  security_mean_score: number;
  // Legacy fields for backward compatibility (may not be present in new API)
  units?: number;
  purchase_date?: string;
  purchase_price?: number;
  current_price?: number;
  initial_investment?: number;
  current_value?: number;
  gain_loss?: number;
  gain_loss_percentage?: number;
}

export interface BondInfoRequest {
  cusip: string;
  weight: number;
}

export interface BondInfoResponse {
  cusip: string;
  weight: number;
  industry_group: string;
  sector_total_score?: number;
  sector_mean_score?: number;
  security_total_score?: number;
  security_mean_score?: number;
  // Legacy fields for backward compatibility (may not be present in new API)
  name?: string;
  issuer?: string;
  units?: number;
  purchase_price?: number;
  purchase_date?: string;
  current_price?: number;
  coupon?: number;
  maturity_date?: string;
  ytm?: number;
  market_value?: number;
  total_cost?: number;
  price_return?: number;
  income_return?: number;
  total_return?: number;
}

export interface PortfolioHarmScoresRequest {
  stocks?: StockInfoResponse[];
  bonds?: BondInfoResponse[];
}

export interface PortfolioHarmScoresResponse {
  average_score: number;
  total_score: number;
  quartile: string;
}

export interface SectorData {
  sector: string;
  sdh_category: string;
  sdh_indicator: string;
  harm_description: string;
  harm_typology: string;
  claim_quantification: string;
  total_magnitude: number;
  reach: number;
  harm_direction: number;
  harm_duration: number;
  direct_indirect_1: string;
  direct_indirect: string;
  core_peripheral: string;
  total_score: number;
  citation_1: string;
  citation_2: string;
}

// Formatted Sector Profile Data (from /profile endpoint)
export interface SectorProfileData {
  "SDH Indicator": string;
  "SDH Category": string;
  "Equity Description": string;
  "Equity Typology": string;
  "Claim Quantification": string;
  "Total Magnitude": number;
  "Reach": number;
  "Equity Direction": number;
  "Equity Duration": number;
  "Total Score": number;
  "Direct_Indirect": string;
  "Direct_Indirect_1": string;
  "Core_Peripheral": string;
  "Citation_1": string;
  "Citation_2": string;
}

export interface SectorInfo {
  sector: string;
  total_score: number;
  mean_score: number;
}

export interface SankeyData {
  node_list: string[];
  source: number[];
  target: number[];
  value: number[];
  node_colors: string[];
  level_colors: {
    sector: string;
    harm_typology: string;
    sdh_category: string;
    sdh_indicator: string;
  };
}

export interface ResearchAlert {
  Sector: string;
  SDH_Category: string;
  SDH_Indicator: string;
  Harm_Description: string;
  Original_Claim_Quantification: string;
  New_Evidence?: string;
}

// API Functions
export const api = {
  // Stock Information
  async getStockInfo(data: StockInfoRequest): Promise<StockInfoResponse> {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/stocks/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to get stock info: ${response.statusText}`);
    }
    return response.json();
  },

  // Bond Information
  async getBondInfo(data: BondInfoRequest): Promise<BondInfoResponse> {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/bonds/info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to get bond info: ${response.statusText}`);
    }
    return response.json();
  },

  // Calculate Stock Portfolio Harm Scores
  async calculateStockHarmScores(
    stocks: StockInfoResponse[]
  ): Promise<PortfolioHarmScoresResponse> {
    console.log("=== CALCULATE STOCK HARM SCORES ===");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Stocks being sent:", stocks);
    const url = `${API_BASE_URL}/api/portfolio/harm-scores/stocks`;
    console.log("Request URL:", url);
    console.log("Request body:", JSON.stringify({ stocks }, null, 2));
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stocks }),
      });
      
      console.log("Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Failed to calculate stock harm scores: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Stock harm scores response:", data);
      console.log("=== END CALCULATE STOCK HARM SCORES ===");
      return data;
    } catch (error) {
      console.error("Error in calculateStockHarmScores:", error);
      throw error;
    }
  },

  // Calculate Bond Portfolio Harm Scores
  async calculateBondHarmScores(
    bonds: BondInfoResponse[]
  ): Promise<PortfolioHarmScoresResponse> {
    console.log("=== CALCULATE BOND HARM SCORES ===");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Bonds being sent:", bonds);
    const url = `${API_BASE_URL}/api/portfolio/harm-scores/bonds`;
    console.log("Request URL:", url);
    console.log("Request body:", JSON.stringify({ bonds }, null, 2));
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bonds }),
      });
      
      console.log("Response status:", response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Failed to calculate bond harm scores: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Bond harm scores response:", data);
      console.log("=== END CALCULATE BOND HARM SCORES ===");
      return data;
    } catch (error) {
      console.error("Error in calculateBondHarmScores:", error);
      throw error;
    }
  },

  // Get Available Sectors
  async getSectors(): Promise<string[]> {
    console.log("Fetching sectors from:", `${API_BASE_URL}/api/sectors/list`);
    const response = await fetch(`${API_BASE_URL}/api/sectors/list`);
    console.log("Sectors response status:", response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`Failed to get sectors: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Sectors data received:", data);
    return data;
  },

  // Get Sector Data
  async getSectorData(sector: string): Promise<SectorData[]> {
    const response = await fetch(`${API_BASE_URL}/api/sectors/${encodeURIComponent(sector)}/data`);
    if (!response.ok) {
      throw new Error(`Failed to get sector data: ${response.statusText}`);
    }
    return response.json();
  },

  // Get Formatted Sector Profile
  async getSectorProfile(sector: string): Promise<SectorProfileData[]> {
    const url = `${API_BASE_URL}/api/sectors/${encodeURIComponent(sector)}/profile`;
    console.log("=== SECTOR PROFILE API CALL ===");
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Sector:", sector);
    console.log("Full URL:", url);
    console.log("Fetching sector profile from:", url);
    
    try {
      const response = await fetch(url);
      console.log("Sector profile response status:", response.status, response.statusText);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);
        throw new Error(`Failed to get sector profile: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Sector profile data received:", data);
      console.log("=== END SECTOR PROFILE API CALL ===");
      return data;
    } catch (error) {
      console.error("Sector profile fetch error:", error);
      throw error;
    }
  },

  // Get Sankey Diagram Data
  async getSankeyData(
    sector: string,
    subtractMax: boolean = true,
    maxValue: number = 15
  ): Promise<SankeyData> {
    const params = new URLSearchParams({
      subtract_max: subtractMax.toString(),
      max_value: maxValue.toString(),
    });
    const response = await fetch(
      `${API_BASE_URL}/api/sectors/${encodeURIComponent(sector)}/sankey?${params}`
    );
    if (!response.ok) {
      throw new Error(`Failed to get sankey data: ${response.statusText}`);
    }
    return response.json();
  },

  // Get Sector Info
  async getSectorInfo(sector: string): Promise<SectorInfo> {
    const response = await fetch(`${API_BASE_URL}/api/sectors/${encodeURIComponent(sector)}/info`);
    if (!response.ok) {
      throw new Error(`Failed to get sector info: ${response.statusText}`);
    }
    return response.json();
  },

  // Get Research Alerts
  async getResearchAlerts(): Promise<ResearchAlert[]> {
    const response = await fetch(`${API_BASE_URL}/api/research-alerts`);
    if (!response.ok) {
      throw new Error(`Failed to get research alerts: ${response.statusText}`);
    }
    return response.json();
  },

  // Generate PDF Report
  async generatePDFReport(
    sector: string,
    portfolioHarmScores: PortfolioHarmScoresResponse
  ): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/reports/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sector,
        portfolio_harm_scores: portfolioHarmScores,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate PDF report: ${response.statusText}`);
    }
    return response.blob();
  },

  // Get Kataly Holdings
  async getKatalyHoldings(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/holdings/kataly`);
    if (!response.ok) {
      throw new Error(`Failed to get Kataly holdings: ${response.statusText}`);
    }
    return response.json();
  },
};


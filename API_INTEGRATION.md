# API Integration Guide

This document explains how the frontend is integrated with the backend API.

## Setup

1. **Environment Variables**

   Create a `.env` file in the root directory with your backend API URL:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

   Replace `http://localhost:8000` with your actual backend URL.

2. **Install Dependencies**

   All required dependencies are already installed. The main ones for API integration are:
   - `@tanstack/react-query` - For data fetching and caching
   - `mammoth` - For DOCX file parsing

## API Integration Overview

### Files Created/Modified

1. **`src/lib/api.ts`** - Contains all API endpoint functions
2. **`src/hooks/use-api.ts`** - React Query hooks for data fetching
3. **Components Updated:**
   - `src/components/ResearchAlertTable.tsx` - Now fetches real research alerts
   - `src/components/SankeyDiagram.tsx` - Now fetches real Sankey data
   - `src/components/PortfolioHoldingsTable.tsx` - Updated to work with API data format
   - `src/pages/Index.tsx` - Integrated with real sectors and harm scores

### API Endpoints Used

#### Stock & Bond Information
- `POST /api/portfolio/stocks/info` - Get stock information
- `POST /api/portfolio/bonds/info` - Get bond information

#### Harm Score Calculation
- `POST /api/portfolio/harm-scores/stocks` - Calculate stock portfolio harm scores
- `POST /api/portfolio/harm-scores/bonds` - Calculate bond portfolio harm scores

#### Sectors
- `GET /api/sectors/list` - Get available sectors
- `GET /api/sectors/{sector}/data` - Get sector data
- `GET /api/sectors/{sector}/profile` - Get formatted sector profile
- `GET /api/sectors/{sector}/sankey` - Get Sankey diagram data
- `GET /api/sectors/{sector}/info` - Get sector info

#### Research Alerts
- `GET /api/research-alerts` - Get research alerts

#### Reports
- `POST /api/reports/pdf` - Generate PDF report

#### Holdings
- `GET /api/holdings/kataly` - Get Kataly holdings

## Usage Examples

### Fetching Stock Information

```typescript
import { useStockInfo } from "@/hooks/use-api";

const MyComponent = () => {
  const { data, isLoading, error } = useStockInfo({
    ticker: "AAPL",
    units: 100,
    purchase_date: "2024-01-01",
    purchase_price: 150.00
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Stock: {data?.stock}</div>;
};
```

### Calculating Harm Scores

```typescript
import { useStockHarmScores } from "@/hooks/use-api";
import { StockInfoResponse } from "@/lib/api";

const MyComponent = () => {
  const stocks: StockInfoResponse[] = [/* your stock data */];
  const { data: harmScores } = useStockHarmScores(stocks);
  
  return (
    <div>
      Average Score: {harmScores?.average_score}
      Total Score: {harmScores?.total_score}
      Quartile: {harmScores?.quartile}
    </div>
  );
};
```

### Fetching Sectors

```typescript
import { useSectors } from "@/hooks/use-api";

const MyComponent = () => {
  const { data: sectors } = useSectors();
  
  return (
    <select>
      {sectors?.map(sector => (
        <option key={sector} value={sector}>{sector}</option>
      ))}
    </select>
  );
};
```

## Data Flow

1. **Portfolio Holdings**: 
   - User provides stock/bond data
   - Frontend calls `POST /api/portfolio/stocks/info` or `/bonds/info` for each holding
   - Holdings are stored in component state
   - Harm scores are calculated using `POST /api/portfolio/harm-scores/stocks` or `/bonds`

2. **Sectors**:
   - On page load, `GET /api/sectors/list` fetches all available sectors
   - User selects a sector from dropdown
   - Sankey diagram data is fetched using `GET /api/sectors/{sector}/sankey`

3. **Research Alerts**:
   - On page load, `GET /api/research-alerts` fetches all research alerts
   - Data is displayed in the ResearchAlertTable component

## Error Handling

All API calls include error handling:
- Loading states are shown while fetching
- Error messages are displayed if requests fail
- Fallback values are provided for missing data

## Notes

- The API base URL defaults to `http://localhost:8000` if not set in environment variables
- All API calls use React Query for caching and automatic refetching
- The PortfolioHoldingsTable component supports both stocks and bonds
- Harm scores are automatically calculated when holdings are updated

## Next Steps

To fully integrate with your backend:

1. Set the `VITE_API_BASE_URL` environment variable
2. Ensure your backend is running and accessible
3. Add functionality to input/load portfolio holdings (currently using empty arrays)
4. Test each endpoint to ensure data flows correctly


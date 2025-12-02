import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSectorProfile } from "@/hooks/use-api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectorEquityProfileTableProps {
  sector: string;
}

// Component to display long text with tooltip and dialog
const LongTextCell = ({ text, label }: { text: string; label: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const truncatedText = text && text.length > 80 ? text.substring(0, 80) + "..." : text;
  const needsTruncation = text && text.length > 80;

  if (!text) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="line-clamp-2 text-sm" style={{ maxWidth: "200px" }}>
            {truncatedText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        </TooltipContent>
      </Tooltip>
      {needsTruncation && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export const SectorEquityProfileTable = ({ sector }: SectorEquityProfileTableProps) => {
  console.log("SectorEquityProfileTable rendered with sector:", sector);
  const { data: sectorData, isLoading, error, refetch } = useSectorProfile(sector, !!sector);
  
  // Debug logging
  useEffect(() => {
    console.log("SectorEquityProfileTable useEffect - Selected sector:", sector);
    console.log("SectorEquityProfileTable useEffect - Data:", sectorData);
    console.log("SectorEquityProfileTable useEffect - Loading:", isLoading);
    console.log("SectorEquityProfileTable useEffect - Error:", error);
  }, [sector, sectorData, isLoading, error]);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center" style={{ width: "100%", height: "500px" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading sector equity profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-8 text-center" style={{ width: "100%", height: "500px" }}>
        <p className="text-destructive">Failed to load sector equity profile. Please try again later.</p>
      </div>
    );
  }

  if (!sectorData || sectorData.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center" style={{ width: "100%", height: "500px" }}>
        <p className="text-muted-foreground">No sector equity profile data available.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg" style={{ width: "100%", height: "500px", position: "relative" }}>
      <div 
        className="sector-profile-scroll"
        style={{ 
          width: "100%",
          height: "100%",
          overflowX: "scroll",
          overflowY: "scroll",
          scrollbarWidth: "thin",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div style={{ minWidth: "1640px", width: "1640px" }}>
          <Table style={{ tableLayout: "fixed", width: "1640px" }}>
          <TableHeader>
            <TableRow className="bg-table-header hover:bg-table-header">
              <TableHead className="font-semibold" style={{ width: "150px" }}>SDH Indicator</TableHead>
              <TableHead className="font-semibold" style={{ width: "150px" }}>SDH Category</TableHead>
              <TableHead className="font-semibold" style={{ width: "200px" }}>Equity Description</TableHead>
              <TableHead className="font-semibold" style={{ width: "150px" }}>Equity Typology</TableHead>
              <TableHead className="font-semibold" style={{ width: "180px" }}>Claim Quantification</TableHead>
              <TableHead className="font-semibold" style={{ width: "100px" }}>Total Magnitude</TableHead>
              <TableHead className="font-semibold" style={{ width: "80px" }}>Reach</TableHead>
              <TableHead className="font-semibold" style={{ width: "100px" }}>Equity Direction</TableHead>
              <TableHead className="font-semibold" style={{ width: "100px" }}>Equity Duration</TableHead>
              <TableHead className="font-semibold" style={{ width: "100px" }}>Total Score</TableHead>
              <TableHead className="font-semibold" style={{ width: "150px" }}>Citation_1</TableHead>
              <TableHead className="font-semibold" style={{ width: "150px" }}>Citation_2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectorData && Array.isArray(sectorData) && sectorData.map((row: any, index) => {
              try {
                return (
                  <TableRow key={index} className={index % 2 === 1 ? "bg-table-alt" : ""}>
                    <TableCell style={{ width: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row["SDH Indicator"] || row.sdh_indicator || "-"}
                    </TableCell>
                    <TableCell style={{ width: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row["SDH Category"] || row.sdh_category || "-"}
                    </TableCell>
                    <TableCell style={{ width: "200px" }}>
                      <LongTextCell text={row["Equity Description"] || row.harm_description || ""} label="Equity Description" />
                    </TableCell>
                    <TableCell style={{ width: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row["Equity Typology"] || row.harm_typology || "-"}
                    </TableCell>
                    <TableCell style={{ width: "180px" }}>
                      <LongTextCell text={row["Claim Quantification"] || row.claim_quantification || ""} label="Claim Quantification" />
                    </TableCell>
                    <TableCell style={{ width: "100px", textAlign: "right" }}>
                      {(() => {
                        const value = row["Total Magnitude"] ?? row.total_magnitude;
                        return value != null && !isNaN(value) ? Number(value).toFixed(2) : "-";
                      })()}
                    </TableCell>
                    <TableCell style={{ width: "80px", textAlign: "right" }}>
                      {(() => {
                        const value = row["Reach"] ?? row.reach;
                        return value != null && !isNaN(value) ? Number(value).toFixed(2) : "-";
                      })()}
                    </TableCell>
                    <TableCell style={{ width: "100px", textAlign: "right" }}>
                      {(() => {
                        const value = row["Equity Direction"] ?? row.harm_direction;
                        return value != null && !isNaN(value) ? Number(value).toFixed(2) : "-";
                      })()}
                    </TableCell>
                    <TableCell style={{ width: "100px", textAlign: "right" }}>
                      {(() => {
                        const value = row["Equity Duration"] ?? row.harm_duration;
                        return value != null && !isNaN(value) ? Number(value).toFixed(2) : "-";
                      })()}
                    </TableCell>
                    <TableCell style={{ width: "100px", textAlign: "right" }}>
                      {(() => {
                        const value = row["Total Score"] ?? row.total_score;
                        return value != null && !isNaN(value) ? Number(value).toFixed(2) : "-";
                      })()}
                    </TableCell>
                    <TableCell style={{ width: "150px" }}>
                      <LongTextCell text={row["Citation_1"] || row.citation_1 || ""} label="Citation 1" />
                    </TableCell>
                    <TableCell style={{ width: "150px" }}>
                      <LongTextCell text={row["Citation_2"] || row.citation_2 || ""} label="Citation 2" />
                    </TableCell>
                  </TableRow>
                );
              } catch (err) {
                console.error("Error rendering row:", err, row);
                return (
                  <TableRow key={index}>
                    <TableCell colSpan={12} className="text-destructive">
                      Error rendering row {index + 1}
                    </TableCell>
                  </TableRow>
                );
              }
             })}
           </TableBody>
         </Table>
         </div>
       </div>
     </div>
   );
 };


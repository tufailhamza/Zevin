import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResearchAlerts } from "@/hooks/use-api";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// Component to display New Evidence with tooltip and dialog
const NewEvidenceCell = ({ text }: { text: string }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const truncatedText = text.length > 100 ? text.substring(0, 100) + "..." : text;
  const needsTruncation = text.length > 100;

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="line-clamp-2 text-sm" style={{ maxWidth: "180px" }}>
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
              <DialogTitle>New Evidence</DialogTitle>
              <DialogDescription>Full text of the new evidence</DialogDescription>
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

export const ResearchAlertTable = () => {
  const { data: researchAlerts, isLoading, error } = useResearchAlerts();

  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading research alerts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-destructive">Failed to load research alerts. Please try again later.</p>
      </div>
    );
  }

  if (!researchAlerts || researchAlerts.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No research alerts available.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg" style={{ width: "100%", height: "600px", position: "relative" }}>
      <div 
        className="research-alert-scroll"
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
        <div style={{ minWidth: "1300px", width: "1300px" }}>
          <Table style={{ tableLayout: "fixed", width: "1300px" }}>
        <TableHeader>
          <TableRow className="bg-table-header hover:bg-table-header">
            <TableHead className="font-semibold" style={{ width: "120px" }}>Sector</TableHead>
            <TableHead className="font-semibold" style={{ width: "180px" }}>SDH_Category</TableHead>
            <TableHead className="font-semibold" style={{ width: "200px" }}>SDH_Indicator</TableHead>
            <TableHead className="font-semibold" style={{ width: "300px" }}>Harm_Description</TableHead>
            <TableHead className="font-semibold" style={{ width: "300px" }}>Original_Claim_Quantification</TableHead>
            {researchAlerts.some((alert) => alert.New_Evidence) && (
              <TableHead className="font-semibold" style={{ width: "200px" }}>New_Evidence</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {researchAlerts.map((row, index) => (
            <TableRow key={index} className={index % 2 === 1 ? "bg-table-alt" : ""}>
              <TableCell className="text-accent font-medium" style={{ width: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.Sector}</TableCell>
              <TableCell style={{ width: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.SDH_Category}</TableCell>
              <TableCell style={{ width: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.SDH_Indicator}</TableCell>
              <TableCell style={{ width: "300px", wordWrap: "break-word" }}>{row.Harm_Description}</TableCell>
              <TableCell style={{ width: "300px", wordWrap: "break-word" }}>{row.Original_Claim_Quantification}</TableCell>
              {row.New_Evidence && (
                <TableCell style={{ width: "200px" }}>
                  <NewEvidenceCell text={row.New_Evidence} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
      </div>
    </div>
  );
};

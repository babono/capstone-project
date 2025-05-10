import { Button } from "@mui/material";
import html2canvas from 'html2canvas-pro';
import { RefObject } from "react";

interface DownloadReportProps {
  reportRefObj: RefObject<HTMLDivElement | null>;
}

// To generate image of the analysis reports
const DownloadReport: React.FC<DownloadReportProps> = ({ reportRefObj }) => {

  const downloadImageReport = (reportRefObj: RefObject<HTMLDivElement | null>) => {
    if (reportRefObj.current) {
      html2canvas(reportRefObj.current, { scrollY: -window.scrollY }).then(canvas => {
        const link = document.createElement("a");
        link.download = "report.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    } else {
      alert("No report available to download");
    }
  }

  return (
    <div className="my-4">
      <Button variant="outlined" color="secondary" onClick={() => downloadImageReport(reportRefObj)}>
        Download Report
      </Button>
    </div>
  )
}

export default DownloadReport;

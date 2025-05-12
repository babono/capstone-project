// @ts-nocheck
import FileUploader from "../common/file-uploader";
import { PAGE_KEYS, PAGE_LABELS, ORDER_PLACEMENT_BUCKET_URL, GOODS_RECEIPT_BUCKET_URL, SHORTAGE_REPORT_BUCKET_URL } from "@/app/constants";

const FileUploaderSection = ({ handleOrderPlacementData, handleGoodsReceiptData, handleShortageReportData }) => {
  return (
    <div>
      <FileUploader
        type={PAGE_KEYS.ORDER_PLACEMENT}
        title={PAGE_LABELS.ORDER_PLACEMENT}
        fileBucketURL={ORDER_PLACEMENT_BUCKET_URL}
        onDataRetrieved={handleOrderPlacementData}
      />
      <FileUploader
        type={PAGE_KEYS.GOODS_RECEIPT}
        title={PAGE_LABELS.GOODS_RECEIPT}
        fileBucketURL={GOODS_RECEIPT_BUCKET_URL}
        onDataRetrieved={handleGoodsReceiptData}
      />
      <FileUploader
        type={PAGE_KEYS.SHORTAGE_REPORT}
        title={PAGE_LABELS.SHORTAGE_REPORT}
        fileBucketURL={SHORTAGE_REPORT_BUCKET_URL}
        onDataRetrieved={handleShortageReportData}
      />
    </div>
  );
};

export default FileUploaderSection;

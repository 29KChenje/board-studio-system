import { pdfExportService } from "../services/pdfExportService.js";

const streamPdf = async (builder, res, filename) => {
  const doc = await builder;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  doc.pipe(res);
  doc.end();
};

export const exportController = {
  cuttingList: async (req, res) =>
    streamPdf(
      pdfExportService.buildCuttingListPdf(req.params.projectId),
      res,
      `cutting-list-project-${req.params.projectId}.pdf`
    ),

  cuttingLayout: async (req, res) =>
    streamPdf(
      pdfExportService.buildCuttingLayoutPdf(req.params.projectId),
      res,
      `cutting-layout-project-${req.params.projectId}.pdf`
    ),

  invoice: async (req, res) =>
    streamPdf(
      pdfExportService.buildInvoicePdf(req.params.orderId),
      res,
      `invoice-order-${req.params.orderId}.pdf`
    ),

  receipt: async (req, res) =>
    streamPdf(
      pdfExportService.buildReceiptPdf(req.params.orderId),
      res,
      `receipt-order-${req.params.orderId}.pdf`
    )
};

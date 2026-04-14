import PDFDocument from "pdfkit";
import { orderRepository } from "../repositories/orderRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { pieceRepository } from "../repositories/pieceRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { ApiError } from "../utils/ApiError.js";
import { optimizationService } from "./optimizationService.js";

const edgingSummary = (piece) =>
  ["T", "B", "L", "R"]
    .filter((edge, index) => [piece.edging_top, piece.edging_bottom, piece.edging_left, piece.edging_right][index])
    .join(", ") || "None";

const makeDoc = (title) => {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.fontSize(20).text(title);
  doc.moveDown(0.5);
  return doc;
};

const renderOrderHeader = (doc, order, title) => {
  doc.fontSize(20).text(title);
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Order #: ${order.id}`);
  doc.text(`Customer: ${order.customer_name || order.shipping_name || "N/A"}`);
  doc.text(`Email: ${order.customer_email || order.shipping_email || "N/A"}`);
  doc.text(`Order Type: ${order.order_type}`);
  doc.text(`Status: ${order.status}`);
  doc.text(`Payment Status: ${order.payment_status}`);
  doc.moveDown();
};

export const pdfExportService = {
  buildCuttingListPdf: async (projectId) => {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const pieces = await pieceRepository.findByProjectId(projectId);
    const doc = makeDoc("Board Studio System - Cutting List");

    doc.fontSize(10).text(`Project: ${project.name}`);
    doc.text(`Dimensions: ${project.width} x ${project.height} x ${project.depth} mm`);
    doc.text(`Board Size: ${project.board_width} x ${project.board_height} mm`);
    doc.moveDown();

    pieces.forEach((piece, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${piece.name}`, { continued: false })
        .fontSize(10)
        .text(`Size: ${piece.width} x ${piece.height} mm | Qty: ${piece.quantity}`)
        .text(`Grain: ${piece.grain_direction} | Edging: ${edgingSummary(piece)}`)
        .moveDown(0.5);
    });

    return doc;
  },

  buildCuttingLayoutPdf: async (projectId) => {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new ApiError(404, "Project not found");

    const pieces = await pieceRepository.findByProjectId(projectId);
    const optimization = optimizationService.optimize({
      pieces,
      boardWidth: project.board_width,
      boardHeight: project.board_height
    });

    const doc = makeDoc("Board Studio System - Cutting Layout");
    doc.fontSize(10).text(`Project: ${project.name}`);
    doc.text(`Boards Used: ${optimization.boardCount}`);
    doc.text(`Waste: ${optimization.totalWastePercentage}%`);
    doc.moveDown();

    optimization.boards.forEach((board) => {
      doc.fontSize(12).text(`${board.board} | Waste ${board.wastePercentage}%`);
      const originX = 60;
      const originY = doc.y + 10;
      const drawableWidth = 460;
      const scale = drawableWidth / board.boardWidth;
      const drawableHeight = board.boardHeight * scale;

      doc.rect(originX, originY, board.boardWidth * scale, drawableHeight).stroke("#6a4a2f");

      board.placements.forEach((placement) => {
        const x = originX + placement.x * scale;
        const y = originY + placement.y * scale;
        const width = placement.width * scale;
        const height = placement.height * scale;
        doc.rect(x, y, width, height).fillAndStroke("#d7b98f", "#6a4a2f");
        doc
          .fillColor("#251d17")
          .fontSize(7)
          .text(
            `${placement.name}\n${placement.width} x ${placement.height}\nEdges: ${["T", "B", "L", "R"].filter((edge, index) => [placement.edgingTop, placement.edgingBottom, placement.edgingLeft, placement.edgingRight][index]).join(", ") || "None"}`,
            x + 3,
            y + 3,
            { width: Math.max(width - 6, 24), height: Math.max(height - 6, 18) }
          );
      });

      doc.fillColor("#000000");
      doc.moveDown();
      doc.y = originY + drawableHeight + 18;
    });

    return doc;
  },

  buildInvoicePdf: async (orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    const items = await orderRepository.findItemsByOrderId(orderId);
    const doc = makeDoc("Board Studio System - Invoice");

    renderOrderHeader(doc, order, "Board Studio System - Invoice");
    doc.text(`Billing Address: ${order.shipping_address || "N/A"}`);
    doc.moveDown();

    items.forEach((item, index) => {
      doc
        .fontSize(11)
        .text(`${index + 1}. ${item.product_name}`)
        .fontSize(10)
        .text(`Qty: ${item.quantity} | Unit: R ${item.unit_price} | Line Total: R ${item.line_total}`)
        .moveDown(0.4);
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total Due: R ${order.total_cost}`);
    return doc;
  },

  buildReceiptPdf: async (orderId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    const payments = await paymentRepository.findByOrderId(orderId);
    const doc = makeDoc("Board Studio System - Payment Receipt");

    renderOrderHeader(doc, order, "Board Studio System - Payment Receipt");
    const payment = payments[0];
    doc.fontSize(10).text(`Payment Reference: ${payment?.reference_code || order.payment_reference || "N/A"}`);
    doc.text(`Payment Method: ${payment?.method || order.payment_method || "N/A"}`);
    doc.text(`Amount Paid: R ${payment?.amount || order.payment_amount || order.total_cost}`);
    doc.text(`Provider: ${payment?.provider || "simulated"}`);
    doc.moveDown();
    doc.fontSize(12).text("Thank you for your payment.");
    return doc;
  }
};

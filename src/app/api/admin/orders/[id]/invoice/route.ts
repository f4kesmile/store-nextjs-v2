import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        reseller: true
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Invoice #${order.id}`, 20, 45);
    doc.text(`Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID')}`, 20, 55);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 65);
    
    // Customer Info
    doc.setFontSize(14);
    doc.text('CUSTOMER:', 20, 85);
    doc.setFontSize(12);
    doc.text(order.customerName, 20, 95);
    doc.text(order.customerEmail, 20, 105);
    doc.text(order.customerPhone, 20, 115);
    if (order.customerAddress) {
      doc.text(order.customerAddress, 20, 125);
    }
    
    // Items Header
    let yPos = 150;
    doc.setFontSize(14);
    doc.text('ITEMS:', 20, yPos);
    yPos += 15;
    
    // Items Table Header
    doc.setFontSize(10);
    doc.text('Produk', 20, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Harga', 140, yPos);
    doc.text('Total', 170, yPos);
    yPos += 10;
    
    // Items
    order.items.forEach((item) => {
      doc.text(item.product.name, 20, yPos);
      if (item.variant) {
        doc.text(`${item.variant.name}: ${item.variant.value}`, 25, yPos + 8);
        yPos += 8;
      }
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`Rp ${Number(item.unitPrice).toLocaleString('id-ID')}`, 140, yPos);
      doc.text(`Rp ${Number(item.totalPrice).toLocaleString('id-ID')}`, 170, yPos);
      yPos += 15;
    });
    
    // Total
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`TOTAL: Rp ${Number(order.totalAmount).toLocaleString('id-ID')}`, 140, yPos);
    
    // Notes
    if (order.notes) {
      yPos += 20;
      doc.setFontSize(10);
      doc.text('Catatan:', 20, yPos);
      doc.text(order.notes, 20, yPos + 10);
    }
    
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${orderId}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('Failed to generate invoice:', error);
    return NextResponse.json(
      { error: 'Gagal membuat invoice' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    
    const transformedOrder = {
      id: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: Number(order.totalAmount),
      totalItems: order.totalItems,
      status: order.status.toLowerCase(),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        variantName: item.variant?.name,
        variantValue: item.variant?.value,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        notes: item.notes
      })),
      reseller: order.reseller ? {
        name: order.reseller.name,
        uniqueId: order.reseller.uniqueId,
        whatsappNumber: order.reseller.whatsappNumber
      } : null
    };
    
    return NextResponse.json({
      order: transformedOrder
    });
    
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail pesanan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { status, notes } = await req.json();
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
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
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: null,
        type: 'order_updated',
        title: `Pesanan #${orderId} Diupdate`,
        description: `Status pesanan diubah menjadi ${status || 'tidak berubah'}`,
        action: `Order status updated: ${orderId} -> ${status}`,
        metadata: {
          orderId,
          oldStatus: updatedOrder.status,
          newStatus: status,
          updatedBy: 'admin'
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil diupdate',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status.toLowerCase(),
        totalAmount: Number(updatedOrder.totalAmount)
      }
    });
    
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate pesanan' },
      { status: 500 }
    );
  }
}
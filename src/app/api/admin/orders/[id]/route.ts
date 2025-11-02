import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id);
    
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid' },
        { status: 400 }
      );
    }
    
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        product: true,
        variant: true,
        reseller: true
      }
    });
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      transaction: {
        id: transaction.id,
        customerName: transaction.customerName,
        customerPhone: transaction.customerPhone,
        product: {
          name: transaction.product.name,
          description: transaction.product.description,
          iconUrl: transaction.product.iconUrl
        },
        variant: transaction.variant ? {
          name: transaction.variant.name,
          value: transaction.variant.value
        } : null,
        quantity: transaction.quantity,
        totalPrice: Number(transaction.totalPrice),
        status: transaction.status,
        notes: transaction.notes,
        createdAt: transaction.createdAt.toISOString(),
        reseller: transaction.reseller ? {
          name: transaction.reseller.name,
          whatsappNumber: transaction.reseller.whatsappNumber
        } : null
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail transaksi' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id);
    const { status, notes } = await req.json();
    
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'ID transaksi tidak valid' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      );
    }
    
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date()
      },
      include: {
        product: true,
        variant: true,
        reseller: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil diupdate',
      transaction: updatedTransaction
    });
    
  } catch (error) {
    console.error('Failed to update transaction:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate transaksi' },
      { status: 500 }
    );
  }
}
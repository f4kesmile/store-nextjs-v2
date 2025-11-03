// src/app/api/transactions/export/route.ts (aligned with Orders API)
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'xlsx').toLowerCase();
    const status = searchParams.get('status') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const resellerId = searchParams.get('resellerId');

    // Build where clause for ORDER model (not legacy transaction)
    const where: any = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (resellerId && resellerId !== 'all') where.resellerId = resellerId === 'direct' ? null : Number(resellerId);
    if (dateFrom || dateTo) {
      where.createdAt = {} as any;
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    // Query orders + items to mirror Admin table
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true, variant: true }
        },
        reseller: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // If CSV requested
    if (format === 'csv') {
      const lines: string[] = [];
      const headers = [
        'Order ID','Tanggal','Customer','Items','Total','Status','Reseller'
      ];
      lines.push(headers.join(','));
      for (const o of orders) {
        const itemsText = o.items.map(i => `${i.product.name}${i.variant ? ` (${i.variant.name}: ${i.variant.value})` : ''} x${i.quantity}`).join(' | ');
        const row = [
          o.id,
          `"${o.createdAt.toLocaleString('id-ID')}"`,
          `"${(o.customerName||'').replace(/"/g,'""')}"`,
          `"${itemsText.replace(/"/g,'""')}"`,
          Number(o.totalAmount),
          o.status,
          o.reseller ? `"${o.reseller.name.replace(/"/g,'""')}"` : 'Direct'
        ];
        lines.push(row.join(','));
      }
      const filename = `Orders_Export_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
      return new Response(lines.join('\n'),{
        status:200,
        headers:{
          'Content-Disposition':`attachment; filename="${filename}"`,
          'Content-Type':'text/csv; charset=utf-8'
        }
      });
    }

    // Default: XLSX workbook mirroring table columns
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Orders');

    ws.columns = [
      { header:'Order ID', key:'id', width:24 },
      { header:'Tanggal', key:'date', width:20 },
      { header:'Customer', key:'customer', width:28 },
      { header:'Items', key:'items', width:60 },
      { header:'Total', key:'total', width:16 },
      { header:'Status', key:'status', width:14 },
      { header:'Reseller', key:'reseller', width:22 },
    ];

    for (const o of orders) {
      const itemsText = o.items.map(i => `${i.product.name}${i.variant ? ` (${i.variant.name}: ${i.variant.value})` : ''} x${i.quantity}`).join(' | ');
      ws.addRow({
        id: o.id,
        date: o.createdAt.toLocaleString('id-ID'),
        customer: o.customerName,
        items: itemsText,
        total: Number(o.totalAmount),
        status: o.status,
        reseller: o.reseller?.name || 'Direct',
      });
    }

    ws.getRow(1).font = { bold: true };
    ws.getColumn('total').numFmt = '"Rp " #,##0';

    const buf = await wb.xlsx.writeBuffer();
    const filename = `Orders_Export_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.xlsx`;
    return new Response(buf,{
      status:200,
      headers:{
        'Content-Disposition':`attachment; filename="${filename}"`,
        'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  } catch (e){
    return new Response(JSON.stringify({ error:'EXPORT_FAILED'}),{ status:500, headers:{'Content-Type':'application/json'} });
  }
}

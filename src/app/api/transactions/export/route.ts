// src/app/api/transactions/export/route.ts (styled workbook)
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

    const where: any = {};
    if (status && status !== 'all') where.status = status.toUpperCase();
    if (resellerId && resellerId !== 'all') where.resellerId = resellerId === 'direct' ? null : Number(resellerId);
    if (dateFrom || dateTo) {
      where.createdAt = {} as any;
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true, variant: true } }, reseller: true },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const lines: string[] = [];
      const headers = ['Order ID','Tanggal','Customer','Items','Total','Status','Reseller'];
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
      return new Response(lines.join('\n'),{ status:200, headers:{ 'Content-Disposition':`attachment; filename="${filename}"`, 'Content-Type':'text/csv; charset=utf-8' } });
    }

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Devlog Store';
    wb.created = new Date();

    const ws = wb.addWorksheet('Orders', {
      views: [{ state: 'frozen', ySplit: 1 }],
      properties: { defaultRowHeight: 20 },
    });

    // Header row with branding color
    ws.columns = [
      { header:'Order ID', key:'id', width:24 },
      { header:'Tanggal', key:'date', width:20 },
      { header:'Customer', key:'customer', width:28 },
      { header:'Items', key:'items', width:60 },
      { header:'Total', key:'total', width:16, style:{ numFmt:'"Rp " #,##0' } },
      { header:'Status', key:'status', width:14 },
      { header:'Reseller', key:'reseller', width:22 },
    ];

    // Add rows
    for (const o of orders) {
      const itemsText = o.items.map(i => `${i.product.name}${i.variant ? ` (${i.variant.name}: ${i.variant.value})` : ''} x${i.quantity}`).join(' | ');
      ws.addRow({ id:o.id, date:o.createdAt.toLocaleString('id-ID'), customer:o.customerName, items:itemsText, total:Number(o.totalAmount), status:o.status, reseller: o.reseller?.name || 'Direct' });
    }

    // Style header
    const header = ws.getRow(1);
    header.font = { bold:true, color:{ argb:'FFFFFFFF' } } as any;
    header.alignment = { vertical:'middle', horizontal:'center' } as any;
    header.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'2563EB' } } as any; // blue-600

    // Borders & zebra striping
    ws.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} } as any;
        if (rowNumber % 2 === 0 && rowNumber !== 1) {
          cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'F8FAFC' } } as any; // slate-50
        }
      });
      if (rowNumber !== 1) row.alignment = { vertical:'middle' } as any;
    });

    // Status chip coloring
    for (let r = 2; r <= ws.rowCount; r++){
      const c = ws.getCell(`F${r}`); // status column
      const v = String(c.value || '').toUpperCase();
      if (v === 'COMPLETED') c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'DCFCE7' } } as any;
      if (v === 'PENDING') c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FEF9C3' } } as any;
      if (v === 'CANCELLED') c.fill = { type:'pattern', pattern:'solid', fgColor:{ argb:'FEE2E2' } } as any;
    }

    // Auto filter and table style
    ws.autoFilter = { from: { row:1, column:1 }, to: { row: ws.rowCount, column: ws.columnCount } } as any;

    // Summary sheet
    const sum = wb.addWorksheet('Ringkasan');
    sum.columns = [ { header:'Metrik', key:'m', width:28 }, { header:'Nilai', key:'v', width:20 } ];
    sum.addRows([
      { m:'Total Orders', v: orders.length },
      { m:'Total Revenue', v: { formula:`SUM(Orders!E2:E${ws.rowCount})` } },
    ]);
    sum.getRow(1).font = { bold:true } as any; sum.getColumn(2).numFmt = '"Rp " #,##0';

    const buf = await wb.xlsx.writeBuffer();
    const filename = `Orders_Styled_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.xlsx`;
    return new Response(buf,{ status:200, headers:{ 'Content-Disposition':`attachment; filename="${filename}"`, 'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } });
  } catch (e){
    return new Response(JSON.stringify({ error:'EXPORT_FAILED'}),{ status:500, headers:{'Content-Type':'application/json'} });
  }
}

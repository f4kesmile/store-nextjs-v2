"use client";
import { ProductsTableRow } from "./TableRow";

export default function ProductsTable({ rows }:{ rows: Array<{ id: string } & Record<string, any>> }){
  return (
    <table className="w-full">
      <tbody>
        {rows.map(r => (
          <ProductsTableRow key={r.id} id={r.id} {...r} />
        ))}
      </tbody>
    </table>
  );
}

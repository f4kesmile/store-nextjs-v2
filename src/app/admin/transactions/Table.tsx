"use client";
import { TransactionsTableRow } from "./TableRow";

export default function TransactionsTable({ rows }:{ rows: Array<{ id: string } & Record<string, any>> }){
  return (
    <table className="w-full">
      <tbody>
        {rows.map(r => (
          <TransactionsTableRow key={r.id} id={r.id} {...r} />
        ))}
      </tbody>
    </table>
  );
}

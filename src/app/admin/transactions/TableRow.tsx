"use client";
import { TransactionsEditCell } from "./EditCell";

export function TransactionsTableRow({ id, ...rest }:{ id:string; [k:string]: any }){
  return (
    <tr>
      {/* ...cells lainnya... */}
      <td className="text-right"><TransactionsEditCell id={id}/></td>
    </tr>
  );
}

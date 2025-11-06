"use client";
import { ProductsEditCell } from "./EditCell";

export function ProductsTableRow({ id, ...rest }:{ id:string; [k:string]: any }){
  return (
    <tr>
      {/* ...cells lainnya... */}
      <td className="text-right"><ProductsEditCell id={id}/></td>
    </tr>
  );
}

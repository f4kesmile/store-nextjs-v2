"use client";
import { ResellersEditCell } from "./EditCell";

export function ResellersTableRow({ id, ...rest }:{ id:string; [k:string]: any }){
  return (
    <tr>
      {/* ...cells lainnya... */}
      <td className="text-right"><ResellersEditCell id={id}/></td>
    </tr>
  );
}

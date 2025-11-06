"use client";
import { UsersEditCell } from "./EditCell";

export function UsersTableRow({ id, ...rest }:{ id:string; [k:string]: any }){
  return (
    <tr>
      {/* ...cells lainnya... */}
      <td className="text-right"><UsersEditCell id={id}/></td>
    </tr>
  );
}

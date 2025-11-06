"use client";
import { RolesEditCell } from "./EditCell";

export function RolesTableRow({ name, ...rest }:{ name:string; [k:string]: any }){
  return (
    <tr>
      {/* ...cells lainnya... */}
      <td className="text-right"><RolesEditCell name={name}/></td>
    </tr>
  );
}

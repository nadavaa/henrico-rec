import type { TransactionRow } from "./types";
import { formatCents } from "@/lib/format";

function escapeCsvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function transactionsToCsv(rows: TransactionRow[]): string {
  const header = ["Date", "Type", "Resident", "Item", "Amount", "Payment Method", "Status"];
  const lines = rows.map((r) =>
    [
      r.date,
      r.type,
      r.memberName,
      r.itemLabel,
      formatCents(r.amountCents),
      r.paymentMethod,
      r.status,
    ]
      .map((cell) => escapeCsvCell(String(cell)))
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

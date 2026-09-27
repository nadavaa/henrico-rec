import { transactions } from "@/data/seed";
import type { Transaction } from "@/data/types";

export async function getTransactions(): Promise<Transaction[]> {
  return transactions;
}

export async function getTransactionsByMember(memberId: string): Promise<Transaction[]> {
  return transactions.filter((t) => t.memberId === memberId);
}

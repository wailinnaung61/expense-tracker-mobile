import type { Transaction } from "@/types/api.types";
import { format } from "date-fns";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

export const exportService = {
  /**
   * Export transactions to CSV format
   */
  async exportTransactionsToCSV(
    transactions: Transaction[],
    filename?: string,
  ): Promise<void> {
    try {
      const csvContent = generateCSV(transactions);
      const fileName =
        filename || `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
      const file = new File(Paths.document, fileName);

      await file.create();
      await file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/csv",
          dialogTitle: "Export Transactions",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        throw new Error("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },

  /**
   * Export monthly summary to text format
   */
  async exportMonthlySummary(
    month: string,
    summary: {
      income: number;
      expense: number;
      savings: number;
      investment: number;
      transactions: Transaction[];
    },
    currency: string,
  ): Promise<void> {
    try {
      const content = generateMonthlySummary(month, summary, currency);
      const fileName = `summary_${month}.txt`;
      const file = new File(Paths.document, fileName);

      await file.create();
      await file.write(content);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "text/plain",
          dialogTitle: "Export Monthly Summary",
        });
      } else {
        throw new Error("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  },
};

function generateCSV(transactions: Transaction[]): string {
  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount",
    "Description",
    "Merchant",
    "Payment Method",
    "Status",
    "Note",
  ];

  const rows = transactions.map((tx) => [
    format(new Date(tx.tranactionDate), "yyyy-MM-dd"),
    tx.type,
    tx.categoryName,
    tx.amount.toString(),
    `"${tx.description.replace(/"/g, '""')}"`,
    `"${tx.merchant?.replace(/"/g, '""') || ""}"`,
    `"${tx.paymentMethod?.replace(/"/g, '""') || ""}"`,
    tx.status,
    `"${(tx.note || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function generateMonthlySummary(
  month: string,
  summary: {
    income: number;
    expense: number;
    savings: number;
    investment: number;
    transactions: Transaction[];
  },
  currency: string,
): string {
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-US", {
      style: "currency",
      currency,
    });

  const net = summary.income - summary.expense;
  const savingsRate =
    summary.income > 0 ? ((net / summary.income) * 100).toFixed(1) : "0.0";

  let content = `MONTHLY FINANCIAL SUMMARY\n`;
  content += `Month: ${format(new Date(month + "-01"), "MMMM yyyy")}\n`;
  content += `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}\n`;
  content += `\n${"=".repeat(50)}\n\n`;

  content += `OVERVIEW\n`;
  content += `${"─".repeat(50)}\n`;
  content += `Total Income:     ${formatCurrency(summary.income).padStart(15)}\n`;
  content += `Total Expense:    ${formatCurrency(summary.expense).padStart(15)}\n`;
  content += `Savings:          ${formatCurrency(summary.savings).padStart(15)}\n`;
  content += `Investment:       ${formatCurrency(summary.investment).padStart(15)}\n`;
  content += `${"─".repeat(50)}\n`;
  content += `Net Balance:      ${formatCurrency(net).padStart(15)}\n`;
  content += `Savings Rate:     ${savingsRate}%\n`;
  content += `\n`;

  content += `TRANSACTIONS (${summary.transactions.length} total)\n`;
  content += `${"─".repeat(50)}\n`;

  // Group by type
  const byType: Record<string, Transaction[]> = {};
  summary.transactions.forEach((tx) => {
    if (!byType[tx.type]) byType[tx.type] = [];
    byType[tx.type].push(tx);
  });

  Object.entries(byType).forEach(([type, txs]) => {
    content += `\n${type.toUpperCase()} (${txs.length})\n`;
    txs
      .sort(
        (a, b) =>
          new Date(b.tranactionDate).getTime() -
          new Date(a.tranactionDate).getTime(),
      )
      .forEach((tx) => {
        content += `  ${format(new Date(tx.tranactionDate), "MMM dd")} - ${tx.categoryName.padEnd(15)} ${formatCurrency(tx.amount).padStart(12)} - ${tx.description}\n`;
      });
  });

  content += `\n${"=".repeat(50)}\n`;
  content += `\nEnd of Report\n`;

  return content;
}

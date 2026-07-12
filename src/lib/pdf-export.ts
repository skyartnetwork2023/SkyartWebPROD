import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
  width?: number;
};

export function exportRowsToPdf<T>(opts: {
  title: string;
  subtitle?: string;
  filename: string;
  columns: PdfColumn<T>[];
  rows: T[];
  orientation?: "portrait" | "landscape";
}) {
  const doc = new jsPDF({ orientation: opts.orientation ?? "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(opts.title, 40, 40);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  const stamp = `Generated ${new Date().toLocaleString()}`;
  doc.text(stamp, pageWidth - 40, 40, { align: "right" });
  if (opts.subtitle) doc.text(opts.subtitle, 40, 58);

  autoTable(doc, {
    startY: opts.subtitle ? 74 : 60,
    head: [opts.columns.map((c) => c.header)],
    body: opts.rows.map((row) =>
      opts.columns.map((c) => {
        const v = c.accessor(row);
        return v == null ? "" : String(v);
      }),
    ),
    styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [246, 248, 251] },
    margin: { left: 40, right: 40 },
  });

  const total = (doc as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text(
      `Page ${i} of ${total}`,
      pageWidth - 40,
      doc.internal.pageSize.getHeight() - 20,
      { align: "right" },
    );
  }

  doc.save(opts.filename);
}

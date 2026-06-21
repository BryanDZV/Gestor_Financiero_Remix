import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatMoney, formatDate } from "~/lib/utils";

export function exportTransactionsToPDF(
  transactions: any[], 
  walletName: string, 
  currency: string
) {
  // 1. Inicializamos el documento en formato A4
  const doc = new jsPDF();

  // 2. Configurar título y metadatos
  const dateNow = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" }).format(new Date());
  
  doc.setFontSize(18);
  doc.text("Extracto de Movimientos", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Cuenta: ${walletName}`, 14, 30);
  doc.text(`Generado el: ${dateNow}`, 14, 36);

  // 3. Preparar los datos para la tabla
  const tableColumn = ["Fecha", "Concepto", "Categoría / Presupuesto", "Tipo", "Importe"];
  const tableRows: any[][] = [];

  let totalIncomes = 0;
  let totalExpenses = 0;

  transactions.forEach((tx) => {
    // Cálculos de resumen
    const amount = Number(tx.amount);
    if (tx.type === "income") totalIncomes += amount;
    if (tx.type === "expense") totalExpenses += amount;

    // Formato de fila
    const rowData = [
      formatDate(tx.date),
      tx.concept,
      tx.categories?.name || tx.budgets?.name || "Sin clasificar",
      tx.type === "income" ? "Ingreso" : tx.type === "expense" ? "Gasto" : "Transferencia",
      { content: `${tx.type === 'expense' ? '-' : '+'}${formatMoney(amount, currency)}`, styles: { textColor: tx.type === 'expense' ? [220, 38, 38] : [5, 150, 105], fontStyle: 'bold' } }
    ];
    tableRows.push(rowData);
  });

  // 4. Dibujar la tabla automáticamente
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, // Color Índigo acorde a la app
    margin: { top: 10 },
  });

  // 5. Añadir resumen al final
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Total Ingresos: ${formatMoney(totalIncomes, currency)} | Total Gastos: ${formatMoney(totalExpenses, currency)}`, 14, finalY);

  // 6. Descargar el archivo
  doc.save(`Extracto_${walletName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

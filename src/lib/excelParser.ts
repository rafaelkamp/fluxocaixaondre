import * as XLSX from "xlsx";

export interface CashflowData {
  Mês: string;
  Receitas: number;
  Despesas: number;
  Saldo: number;
}

export const parseExcelFile = async (file: File): Promise<CashflowData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Find the data structure
        let receivedIndex = -1;
        let expensesIndex = -1;
        let monthsStartCol = -1;

        // Find RECEITAS and DESPESAS rows
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "").toUpperCase();
            if (cell === "RECEITAS") receivedIndex = i;
            if (cell === "DESPESAS") expensesIndex = i;
            if (cell.includes("/2025") && monthsStartCol === -1) monthsStartCol = j;
          }
        }

        if (receivedIndex === -1 || expensesIndex === -1 || monthsStartCol === -1) {
          throw new Error("Estrutura de dados não reconhecida. Certifique-se de que o arquivo contém linhas RECEITAS e DESPESAS.");
        }

        // Extract months and data
        const monthsRow = jsonData.find((row) =>
          row.some((cell) => String(cell || "").includes("/2025"))
        );
        if (!monthsRow) throw new Error("Meses não encontrados no arquivo");

        const result: CashflowData[] = [];
        const months = monthsRow.slice(monthsStartCol).filter((m) => m);

        for (let i = 0; i < months.length; i++) {
          const colIndex = monthsStartCol + i;
          const month = String(months[i]);
          
          const receita = parseValue(jsonData[receivedIndex][colIndex]);
          const despesa = parseValue(jsonData[expensesIndex][colIndex]);
          const saldo = receita - despesa;

          result.push({
            Mês: month,
            Receitas: receita,
            Despesas: despesa,
            Saldo: saldo,
          });
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsBinaryString(file);
  });
};

const parseValue = (value: any): number => {
  if (!value) return 0;
  
  // Handle string values with currency formatting
  if (typeof value === "string") {
    // Remove currency symbols and spaces
    const cleaned = value.replace(/[R$\s.]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return typeof value === "number" ? value : 0;
};

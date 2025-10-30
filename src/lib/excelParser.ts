import * as XLSX from "xlsx";

export interface CashflowData {
  Mês: string;
  Receitas: number;
  Despesas: number;
  Outros: number;
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

        console.log("Total rows in Excel:", jsonData.length);
        console.log("First 5 rows:", jsonData.slice(0, 5));

        // Find the data structure - more flexible search
        let receivedIndex = -1;
        let expensesIndex = -1;
        let outrosIndex = -1;
        let monthsStartCol = -1;

        // Find RECEITAS, DESPESAS, and OUTROS rows (search all columns in each row)
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          // Check each cell in the row
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || "").trim().toUpperCase();
            
            if (cell === "RECEITAS" && receivedIndex === -1) {
              receivedIndex = i;
              console.log("Found RECEITAS at row:", i);
            }
            if (cell === "DESPESAS" && expensesIndex === -1) {
              expensesIndex = i;
              console.log("Found DESPESAS at row:", i);
            }
            if (cell === "OUTROS" && outrosIndex === -1) {
              outrosIndex = i;
              console.log("Found OUTROS at row:", i);
            }
            
            // Find first month column
            if (monthsStartCol === -1 && (cell.includes("/2025") || cell.includes("/2024"))) {
              monthsStartCol = j;
              console.log("Found months starting at column:", j);
            }
          }
        }

        console.log("Indices found:", { receivedIndex, expensesIndex, outrosIndex, monthsStartCol });

        if (receivedIndex === -1 || expensesIndex === -1) {
          console.error("Could not find RECEITAS or DESPESAS rows");
          console.log("Sample data:", jsonData.slice(0, 20).map((row, i) => `Row ${i}: ${JSON.stringify(row)}`));
          throw new Error("Estrutura de dados não reconhecida. Certifique-se de que o arquivo contém linhas RECEITAS e DESPESAS.");
        }

        if (monthsStartCol === -1) {
          throw new Error("Não foi possível identificar as colunas de meses.");
        }

        // Extract months from the header row
        const monthsRow = jsonData.find((row) =>
          row && row.some((cell) => {
            const cellStr = String(cell || "").trim();
            return cellStr.includes("/2025") || cellStr.includes("/2024");
          })
        );
        
        if (!monthsRow) {
          throw new Error("Meses não encontrados no arquivo");
        }

        const result: CashflowData[] = [];
        
        // Get all month columns
        for (let j = monthsStartCol; j < monthsRow.length; j++) {
          const monthCell = String(monthsRow[j] || "").trim();
          if (!monthCell || (!monthCell.includes("/2025") && !monthCell.includes("/2024"))) {
            // Stop when we hit a non-month column
            if (result.length > 0) break;
            continue;
          }

          const receita = parseValue(jsonData[receivedIndex][j]);
          const despesa = parseValue(jsonData[expensesIndex][j]);
          const outros = outrosIndex !== -1 ? parseValue(jsonData[outrosIndex][j]) : 0;
          
          // Saldo = Receitas - Despesas + Outros (OUTROS podem ser positivos ou negativos)
          const saldo = receita - despesa + outros;

          result.push({
            Mês: monthCell,
            Receitas: receita,
            Despesas: despesa,
            Outros: outros,
            Saldo: saldo,
          });
        }

        console.log("Parsed data:", result);

        if (result.length === 0) {
          throw new Error("Nenhum dado foi extraído do arquivo.");
        }

        resolve(result);
      } catch (error) {
        console.error("Error parsing Excel:", error);
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

import { Card } from "./ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface CashflowChartsProps {
  data: any[];
}

export const CashflowCharts = ({ data }: CashflowChartsProps) => {
  if (!data || data.length === 0) return null;

  // Calculate summary stats
  const totalRevenue = data.reduce((sum, item) => sum + (item.Receitas || 0), 0);
  const totalExpenses = data.reduce((sum, item) => sum + (item.Despesas || 0), 0);
  const netFlow = totalRevenue - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 relative overflow-hidden" style={{ background: "var(--gradient-card)" }}>
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{ background: "var(--gradient-secondary)" }}
          />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Receitas Totais</span>
            </div>
            <p className="text-3xl font-bold text-secondary">{formatCurrency(totalRevenue)}</p>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden" style={{ background: "var(--gradient-card)" }}>
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">Despesas Totais</span>
            </div>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden" style={{ background: "var(--gradient-card)" }}>
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: netFlow >= 0 ? "var(--gradient-secondary)" : "linear-gradient(135deg, hsl(0 84.2% 60.2%) 0%, hsl(0 62.8% 50%) 100%)",
            }}
          />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Fluxo Líquido</span>
            </div>
            <p className={`text-3xl font-bold ${netFlow >= 0 ? "text-secondary" : "text-destructive"}`}>
              {formatCurrency(netFlow)}
            </p>
          </div>
        </Card>
      </div>

      {/* Line Chart */}
      <Card className="p-6" style={{ background: "var(--gradient-card)" }}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Evolução Mensal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="Mês" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Receitas"
              stroke="hsl(var(--secondary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--secondary))", r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Despesas"
              stroke="hsl(var(--destructive))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--destructive))", r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Saldo"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar Chart */}
      <Card className="p-6" style={{ background: "var(--gradient-card)" }}>
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Comparativo Mensal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="Mês" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="Receitas" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

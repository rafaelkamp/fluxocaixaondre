import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { CashflowCharts } from "@/components/CashflowCharts";
import { AIInsights } from "@/components/AIInsights";
import { parseExcelFile, CashflowData } from "@/lib/excelParser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [cashflowData, setCashflowData] = useState<CashflowData[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    toast.loading("Processando arquivo Excel...");

    try {
      const data = await parseExcelFile(file);
      setCashflowData(data);
      toast.dismiss();
      toast.success("Arquivo processado com sucesso!");

      // Auto-generate insights
      await generateInsights(data, file.name);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.dismiss();
      toast.error("Erro ao processar arquivo. Verifique o formato.");
      setIsLoading(false);
    }
  };

  const generateInsights = async (data: CashflowData[], fileName: string) => {
    setIsAnalyzing(true);
    toast.loading("Gerando insights...");

    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-cashflow", {
        body: { data, fileName },
      });

      toast.dismiss();

      if (error) {
        console.error("Error calling edge function:", error);
        throw error;
      }

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setInsights(result.insights);
      toast.success("Análise concluída!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.dismiss();
      toast.error("Erro ao gerar insights. Tente novamente.");
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCashflowData([]);
    setInsights("");
    setFileName("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Análise de Fluxo de Caixa
                </h1>
                <p className="text-sm text-muted-foreground">Insights inteligentes </p>
              </div>
            </div>
            {cashflowData.length > 0 && (
              <Button onClick={handleReset} variant="outline">
                Nova Análise
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {cashflowData.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4 mb-12">
              <div
                className="inline-block p-4 rounded-2xl mb-4"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold">Transforme dados em decisões</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Envie seu arquivo Excel de fluxo de caixa e receba uma análise completa com gráficos
                interativos e insights gerados por inteligência artificial. Inclui análise de receitas,
                despesas e movimentações da tesouraria (OUTROS).
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* File Info */}
            <div className="text-center pb-4 border-b border-border">
              <h2 className="text-2xl font-semibold text-foreground">Análise de {fileName}</h2>
              <p className="text-muted-foreground mt-1">
                {cashflowData.length} meses de dados processados
              </p>
            </div>

            {/* Charts */}
            <CashflowCharts data={cashflowData} />

            {/* AI Insights */}
            <AIInsights insights={insights} isLoading={isAnalyzing} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>Desenvolvido com inteligência artificial • Análise financeira profissional</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

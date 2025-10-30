import { Card } from "./ui/card";
import { Sparkles, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";

interface AIInsightsProps {
  insights: string;
  isLoading: boolean;
}

export const AIInsights = ({ insights, isLoading }: AIInsightsProps) => {
  if (isLoading) {
    return (
      <Card className="p-8 animate-pulse" style={{ background: "var(--gradient-card)" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="w-6 h-6 text-white animate-spin" />
          </div>
          <h3 className="text-xl font-semibold">Gerando Insights com IA...</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </Card>
    );
  }

  if (!insights) return null;

  // Parse insights into sections
  const sections = insights.split(/\d+\.\s+/).filter((s) => s.trim());

  const getIcon = (index: number) => {
    const icons = [TrendingUp, AlertTriangle, Lightbulb, Sparkles];
    const Icon = icons[index % icons.length];
    return <Icon className="w-5 h-5 text-white" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-8 relative overflow-hidden" style={{ background: "var(--gradient-card)" }}>
        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold">Análise Inteligente</h3>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            {sections.map((section, index) => {
              const lines = section.trim().split("\n");
              const title = lines[0];
              const content = lines.slice(1).join("\n");

              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="p-2 rounded-lg shrink-0 mt-1"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {getIcon(index)}
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-lg font-semibold text-foreground">{title}</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

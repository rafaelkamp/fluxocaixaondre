import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data, fileName } = await req.json();
    console.log("Analyzing cashflow for:", fileName);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Prepare data summary for AI
    const dataSummary = `
Análise de Fluxo de Caixa - ${fileName}

Dados resumidos:
${JSON.stringify(data, null, 2)}

IMPORTANTE: O fluxo de caixa contém três componentes principais:
1. RECEITAS - Valores recebidos através de contas a receber
2. DESPESAS - Valores pagos através de contas a pagar  
3. OUTROS - Movimentações da tesouraria (tarifas bancárias, rendimentos de aplicações, IOF, etc.)

FÓRMULA DO FLUXO LÍQUIDO: Saldo = Receitas - Despesas + Outros

Por favor, analise estes dados financeiros e forneça:
1. Principais tendências observadas nas receitas, despesas e movimentações da tesouraria (OUTROS)
2. Análise específica sobre os itens em OUTROS - identificar principais fontes de receitas/despesas da tesouraria
3. Pontos de atenção ou alertas importantes considerando o impacto de OUTROS no fluxo líquido
4. Oportunidades de otimização identificadas (incluindo gestão da tesouraria)
5. Projeções e recomendações estratégicas
6. Análise de sazonalidade, se aplicável

Seja específico, use números dos dados quando relevante, e forneça insights acionáveis sobre todos os componentes do fluxo.
`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um analista financeiro experiente especializado em análise de fluxo de caixa. Forneça insights claros, práticos e baseados em dados.",
          },
          {
            role: "user",
            content: dataSummary,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0].message.content;

    console.log("Analysis completed successfully");

    return new Response(
      JSON.stringify({ insights }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-cashflow:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { billingArticles, purchaseArticles } = await req.json();

    if (!billingArticles || !purchaseArticles) {
      throw new Error('Missing required data');
    }

    console.log('Matching purchase articles with billing articles');
    console.log(`Billing articles: ${billingArticles.length}`);
    console.log(`Purchase articles: ${purchaseArticles.length}`);

    const prompt = `Tu es un expert en analyse de produits. Je vais te donner deux listes d'articles :

1. Articles facturés (vendus aux clients) avec code article, description et famille
2. Articles d'achat (stock) avec référence PSL, désignation et famille

Ta mission : pour chaque article d'achat, détermine s'il correspond à un article facturé en analysant :
- La famille (peut être strictement identique ou similaire)
- La description/désignation (analyse sémantique, synonymes, variations)
- Le contexte métier (sécurité incendie)

Articles facturés :
${JSON.stringify(billingArticles, null, 2)}

Articles d'achat :
${JSON.stringify(purchaseArticles, null, 2)}

Retourne un tableau JSON avec pour chaque article d'achat :
- ref: la référence PSL
- score: 0-100 (100 = correspondance parfaite)
- reason: explication courte du match
- matchedBillingCode: le code article facturé correspondant (si score >= 70)

Seuls les articles avec score >= 70 doivent avoir un matchedBillingCode.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response');
      throw new Error('Invalid AI response format');
    }

    const matches = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ matches }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in match-purchase-articles function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

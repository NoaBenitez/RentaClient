import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientName, interventionNames } = await req.json();
    
    if (!clientName || !interventionNames || !Array.isArray(interventionNames)) {
      return new Response(
        JSON.stringify({ error: 'clientName et interventionNames sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY n'est pas configuré");
    }

    const systemPrompt = `Tu es un expert en analyse de correspondance de noms. 
Ton rôle est d'analyser la correspondance entre un nom de client et des noms d'interventions.
Pour chaque intervention, tu dois donner un score de 0 à 100 basé sur :
- Mots-clés communs (50 points max) : présence de mots identiques ou similaires
- Similarité phonétique (20 points max) : sons similaires, fautes de frappe courantes
- Abréviations et variations (20 points max) : versions courtes, acronymes
- Contexte métier (10 points max) : noms de sociétés, secteurs d'activité

Retourne UNIQUEMENT un JSON valide avec ce format exact :
{
  "matches": [
    {"name": "nom de l'intervention", "score": 85, "reason": "Explication courte"}
  ]
}`;

    const userPrompt = `Nom du client : "${clientName}"

Interventions à analyser :
${interventionNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

Analyse chaque intervention et retourne un JSON avec les scores.`;

    console.log('Calling Lovable AI for client:', clientName);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, veuillez réessayer plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits épuisés, veuillez ajouter des crédits à votre espace de travail.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Erreur de la gateway IA');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('Pas de réponse de l\'IA');
    }

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let matches;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      const parsed = JSON.parse(jsonStr.trim());
      matches = parsed.matches || [];
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback: return all interventions with low scores
      matches = interventionNames.map(name => ({
        name,
        score: 50,
        reason: 'Analyse automatique'
      }));
    }

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-interventions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
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
    const { headers, sampleRows } = await req.json();

    if (!headers || !Array.isArray(headers)) {
      throw new Error('Headers array is required');
    }

    const prompt = `Tu es un expert en analyse de fichiers de facturation.
Je te donne les en-têtes de colonnes d'un fichier Excel de détails de pièces clients, ainsi que quelques lignes d'exemple.

En-têtes (index → nom) :
${headers.map((h: string, i: number) => `${i}: "${h}"`).join('\n')}

${sampleRows ? `Exemples de données (premières lignes) :\n${JSON.stringify(sampleRows, null, 2)}` : ''}

Tu dois identifier quelle colonne correspond à chacun de ces champs :
- typePiece : type de pièce (ex: "Factures")
- numeroFacture : numéro de facture
- indice : indice
- codeArticle : code article
- description : description/désignation de l'article
- prixUnitaireHT : prix unitaire HT
- quantite : quantité
- montantTotalHT : montant total HT
- familleArticle : famille d'article
- typeAffaire : type d'affaire
- numeroClient : numéro client
- nomClient : nom du client
- dateLivraison : date de livraison
- reference : référence

Retourne UNIQUEMENT un JSON valide avec ce format :
{
  "mapping": {
    "typePiece": 0,
    "numeroFacture": 1,
    "indice": 2,
    "codeArticle": 3,
    "description": 4,
    "prixUnitaireHT": 5,
    "quantite": 6,
    "montantTotalHT": 7,
    "familleArticle": 8,
    "typeAffaire": 9,
    "numeroClient": 10,
    "nomClient": 11,
    "dateLivraison": 12,
    "reference": 13
  }
}

Les valeurs sont les INDEX des colonnes (0-based). Si un champ n'est pas trouvé, mets -1.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    console.log('AI Column Mapping Response:', aiResponse);

    // Extract JSON
    const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
                      aiResponse.match(/```\n?([\s\S]*?)\n?```/) ||
                      aiResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr.trim());

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in map-billing-columns:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

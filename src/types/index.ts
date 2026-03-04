export interface Intervention {
  technicien: string;
  localite: string;
  horaires: string;
  dates: string;
  nomIntervention: string;
  feuille: string;
  date: Date;
}

export interface BillingItem {
  typePiece: string;
  numeroFacture: string;
  indice: string;
  codeArticle: string;
  description: string;
  prixUnitaireHT: number;
  quantite: number;
  montantTotalHT: number;
  familleArticle: string;
  typeAffaire: string;
  numeroClient: string;
  nomClient: string;
  dateLivraison: Date;
  reference?: string;
  selected: boolean;
}

export interface ClientAnalysis {
  client: string;
  interventions: {
    count: number;
    totalHours: number;
    hourlyCost: number;
  };
  billing: BillingItem[];
  includeLabor: boolean;
}

export interface PurchaseArticle {
  famille: string;
  refPsl: string;
  designationPsl: string;
  prixAchat2023: number;
  prixAchat2024: number;
  prixAchat2025: number;
  prixAchatRetenu: number;
  selected: boolean;
  matchedBillingCode?: string;
}

export interface FinancialResults {
  totalHTBilled: number;
  interventionCost: number;
  grossMargin: number;
  marginRate: number;
  travelCost: number;
  vehicleCost: number;
  financialFee: number;
  structureFee: number;
  totalCost: number;
  purchaseArticlesCost?: number;
  netMargin?: number;
  hasPurchaseData: boolean;
}

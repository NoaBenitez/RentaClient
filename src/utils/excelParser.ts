import * as XLSX from 'xlsx';
import { Intervention, BillingItem, PurchaseArticle } from '@/types';

export const parseInterventionsFile = (file: File): Promise<Intervention[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        const interventions: Intervention[] = [];
        
        // Skip header row
        for (let i = 1; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          if (row[0]) { // Check if row has data
            interventions.push({
              technicien: row[0] || '',
              localite: row[1] || '',
              horaires: row[2] || '',
              dates: row[3] || '',
              nomIntervention: row[4] || '',
              feuille: row[5] || '',
              date: parseExcelDate(row[6]) || new Date(),
            });
          }
        }
        
        resolve(interventions);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export interface ColumnMapping {
  typePiece: number;
  numeroFacture: number;
  indice: number;
  codeArticle: number;
  description: number;
  prixUnitaireHT: number;
  quantite: number;
  montantTotalHT: number;
  familleArticle: number;
  typeAffaire: number;
  numeroClient: number;
  nomClient: number;
  dateLivraison: number;
  reference: number;
}

export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  typePiece: 0,
  numeroFacture: 1,
  indice: 2,
  codeArticle: 3,
  description: 4,
  prixUnitaireHT: 5,
  quantite: 6,
  montantTotalHT: 7,
  familleArticle: 8,
  typeAffaire: 9,
  numeroClient: 10,
  nomClient: 11,
  dateLivraison: 12,
  reference: 13,
};

export const extractBillingHeaders = (file: File): Promise<{ headers: string[]; sampleRows: any[][] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        const headers = (jsonData[0] || []).map((h: any) => String(h || ''));
        const sampleRows = jsonData.slice(1, 4); // 3 sample rows
        resolve({ headers, sampleRows });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const parseBillingFileWithMapping = (file: File, mapping: ColumnMapping): Promise<BillingItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        const billingItems: BillingItem[] = [];
        const col = (row: any, idx: number) => idx >= 0 ? row[idx] : undefined;
        
        for (let i = 1; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          if (!row || row.length === 0) continue;
          // Check if at least one meaningful field has data
          const hasData = col(row, mapping.codeArticle) || col(row, mapping.description) || col(row, mapping.nomClient);
          if (!hasData) continue;
          
          billingItems.push({
            typePiece: String(col(row, mapping.typePiece) || ''),
            numeroFacture: String(col(row, mapping.numeroFacture) || ''),
            indice: String(col(row, mapping.indice) || ''),
            codeArticle: String(col(row, mapping.codeArticle) || ''),
            description: String(col(row, mapping.description) || ''),
            prixUnitaireHT: parseFloat(col(row, mapping.prixUnitaireHT)) || 0,
            quantite: parseFloat(col(row, mapping.quantite)) || 0,
            montantTotalHT: parseFloat(col(row, mapping.montantTotalHT)) || 0,
            familleArticle: String(col(row, mapping.familleArticle) || ''),
            typeAffaire: String(col(row, mapping.typeAffaire) || ''),
            numeroClient: String(col(row, mapping.numeroClient) || ''),
            nomClient: String(col(row, mapping.nomClient) || ''),
            dateLivraison: parseExcelDate(col(row, mapping.dateLivraison)) || new Date(),
            reference: String(col(row, mapping.reference) || ''),
            selected: true,
          });
        }
        
        resolve(billingItems);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// Legacy function kept for backward compatibility
export const parseBillingFile = (file: File): Promise<BillingItem[]> => {
  return parseBillingFileWithMapping(file, DEFAULT_COLUMN_MAPPING);
};

const parseExcelDate = (value: any): Date => {
  if (!value) return new Date();
  
  // If it's already a date object
  if (value instanceof Date) return value;
  
  // If it's a string date
  if (typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(value);
  }
  
  // If it's an Excel serial date number
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value);
    return new Date(date.y, date.m - 1, date.d);
  }
  
  return new Date();
};

export const calculateHoursFromTimeSlot = (horaires: string): number => {
  // Extract hours from time slot like "8h-10h" = 2 hours
  const match = horaires.match(/(\d+)h-(\d+)h/);
  if (match) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    return end - start;
  }
  return 2; // Default 2 hours
};

export const getInterventionId = (intervention: Intervention): string => {
  return `${intervention.nomIntervention}_${intervention.date.toISOString()}_${intervention.horaires}_${intervention.technicien}`;
};

export const parsePurchaseArticlesFile = async (file: File): Promise<PurchaseArticle[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const articles: PurchaseArticle[] = [];
        
        // Skip first 8 rows (headers are on row 8, data starts at row 9)
        for (let i = 8; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Column B (index 1): FAMILLE
          // Column O (index 14): REF PSL
          // Column P (index 15): DESIGNATION PSL
          // Column Q (index 16): PRIX ACHAT 2023
          // Column R (index 17): PRIX ACHAT 2024
          // Column S (index 18): PRIX ACHAT 2025
          
          const famille = row[1]?.toString().trim() || '';
          const refPsl = row[14]?.toString().trim() || '';
          const designationPsl = row[15]?.toString().trim() || '';
          
          // Skip empty rows
          if (!famille || !refPsl || !designationPsl) continue;
          
          const prix2023 = parseFloat(row[16]) || 0;
          const prix2024 = parseFloat(row[17]) || 0;
          const prix2025 = parseFloat(row[18]) || 0;
          
          // Priority: 2025 > 2024 > 2023
          const prixRetenu = prix2025 || prix2024 || prix2023;
          
          articles.push({
            famille,
            refPsl,
            designationPsl,
            prixAchat2023: prix2023,
            prixAchat2024: prix2024,
            prixAchat2025: prix2025,
            prixAchatRetenu: prixRetenu,
            selected: false,
          });
        }
        
        resolve(articles);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

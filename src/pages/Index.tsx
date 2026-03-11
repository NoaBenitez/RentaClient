import { useState, useMemo } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ClientSelector } from "@/components/ClientSelector";
import { ReferenceInput } from "@/components/ReferenceInput";
import { DateRangePicker } from "@/components/DateRangePicker";
import { KeywordSelector } from "@/components/KeywordSelector";
import { InterventionsCard } from "@/components/InterventionsCard";
import { InterventionsDialog } from "@/components/InterventionsDialog";
import { BillingCard } from "@/components/BillingCard";
import { UniqueArticlesCard } from "@/components/UniqueArticlesCard";
import { PurchaseArticlesCard } from "@/components/PurchaseArticlesCard";
import { PurchaseArticlesDialog } from "@/components/PurchaseArticlesDialog";
import { SetupStepChip } from "@/components/SetupStepChip";
import { SettingsContent } from "@/components/SettingsContent";
import { KpiSidebar } from "@/components/KpiSidebar";
import { parseInterventionsFile, parseBillingFileWithMapping, extractBillingHeaders, parsePurchaseArticlesFile, calculateHoursFromTimeSlot, getInterventionId, ColumnMapping, DEFAULT_COLUMN_MAPPING } from "@/utils/excelParser";
import { ColumnMappingDialog } from "@/components/ColumnMappingDialog";
import { Intervention, BillingItem, PurchaseArticle, FinancialResults } from "@/types";
import { toast } from "sonner";
import { Search, Settings, Wrench, FileText, Package, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import logoPSL from "@/assets/logopsl_-_original_-_Copie-removebg-preview.png";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [purchaseArticles, setPurchaseArticles] = useState<PurchaseArticle[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [includeLabor, setIncludeLabor] = useState(true);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [travelCost, setTravelCost] = useState(0);
  const [vehicleRate, setVehicleRate] = useState(5);
  const [financialFeeRate, setFinancialFeeRate] = useState(1);
  const [structureFeeRate, setStructureFeeRate] = useState(5);
  
const [interventionsFileName, setInterventionsFileName] = useState<string>("");
  const [interventionMode, setInterventionMode] = useState<"import" | "manual">("import");
  const [manualInterventionCount, setManualInterventionCount] = useState<number>(0);
  const [manualHoursPerIntervention, setManualHoursPerIntervention] = useState<number>(2);
  const [billingFileName, setBillingFileName] = useState<string>("");
  const [billingMode, setBillingMode] = useState<"import" | "manual">("import");
  const [manualBillingAmount, setManualBillingAmount] = useState<number>(0);
  const [purchaseFileName, setPurchaseFileName] = useState<string>("");
  const [purchaseMode, setPurchaseMode] = useState<"import" | "manual">("import");
  const [manualPurchaseAmount, setManualPurchaseAmount] = useState<number>(0);
  const [enabledKeywords, setEnabledKeywords] = useState<Set<string>>(new Set());
  const [selectedInterventions, setSelectedInterventions] = useState<Set<string>>(new Set());
  const [aiScores, setAiScores] = useState<Map<string, { score: number; reason: string }>>(new Map());
  const [purchaseAiScores, setPurchaseAiScores] = useState<Map<string, { score: number; reason: string }>>(new Map());
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPurchaseAiLoading, setIsPurchaseAiLoading] = useState(false);
  const [isInterventionsDialogOpen, setIsInterventionsDialogOpen] = useState(false);
  const [isFilterBarVisible, setIsFilterBarVisible] = useState(true);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [articleFamilies, setArticleFamilies] = useState<Set<string>>(new Set());
  const [planningKeyword, setPlanningKeyword] = useState<string>("");
  const [referenceKeyword, setReferenceKeyword] = useState<string>("");
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [billingHeaders, setBillingHeaders] = useState<string[]>([]);
  const [billingSampleRows, setBillingSampleRows] = useState<any[][]>([]);
  const [billingColumnMapping, setBillingColumnMapping] = useState<ColumnMapping>(DEFAULT_COLUMN_MAPPING);
  const [pendingBillingFile, setPendingBillingFile] = useState<File | null>(null);

  const handleInterventionsUpload = async (file: File) => {
    try {
      const data = await parseInterventionsFile(file);
      setInterventions(data);
      setInterventionsFileName(file.name);
      toast.success("Fichier des interventions importé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'import du fichier des interventions");
      console.error(error);
    }
  };

  const handleBillingUpload = async (file: File) => {
    try {
      toast.info("Analyse des colonnes par l'IA en cours...");
      
      const { headers, sampleRows } = await extractBillingHeaders(file);
      setBillingHeaders(headers);
      setBillingSampleRows(sampleRows);
      setPendingBillingFile(file);
      
      // Call AI to map columns
      const { data: mappingData, error: mappingError } = await supabase.functions.invoke('map-billing-columns', {
        body: { headers, sampleRows }
      });
      
      if (!mappingError && mappingData?.mapping) {
        setBillingColumnMapping(mappingData.mapping as ColumnMapping);
        toast.success("Colonnes détectées par l'IA — vérifiez le mapping");
      } else {
        console.warn('AI mapping failed, using defaults');
        setBillingColumnMapping(DEFAULT_COLUMN_MAPPING);
        toast.warning("Mapping IA échoué, vérifiez manuellement");
      }
      
      setIsMappingDialogOpen(true);
    } catch (error) {
      toast.error("Erreur lors de la lecture du fichier");
      console.error(error);
    }
  };

  const handleMappingConfirm = async (mapping: ColumnMapping) => {
    if (!pendingBillingFile) return;
    try {
      const billingData = await parseBillingFileWithMapping(pendingBillingFile, mapping);
      setBillingItems(billingData);
      setBillingFileName(pendingBillingFile.name);
      setBillingColumnMapping(mapping);
      setPendingBillingFile(null);
      toast.success(`${billingData.length} lignes importées avec le mapping validé`);
    } catch (error) {
      toast.error("Erreur lors de l'import avec ce mapping");
      console.error(error);
    }
  };

  const handlePurchaseUpload = async (file: File) => {
    try {
      const data = await parsePurchaseArticlesFile(file);
      setPurchaseArticles(data);
      setPurchaseFileName(file.name);
      toast.success("Fichier des articles d'achat importé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'import du fichier articles");
      console.error(error);
    }
  };

  const uniqueClients = useMemo(() => {
    const clientsFromBilling = [...new Set(billingItems.map(b => b.nomClient))];
    return clientsFromBilling.filter(c => c).sort();
  }, [billingItems]);

  // Extract keywords from selected client and reference, find matches
  const keywordMatches = useMemo(() => {
    if (!selectedClient) return [];
    
    // Split client name into words (keywords)
    const clientKeywords = selectedClient
      .toLowerCase()
      .split(/[\s\-_,]+/) // Split on space, dash, underscore, comma
      .filter(word => word.length > 2); // Only keep words with 3+ characters
    
    // Split reference into words if provided
    const referenceKeywords = reference
      ? reference.toLowerCase().split(/[\s\-_,]+/).filter(word => word.length > 2)
      : [];
    
    // Add custom planning keyword if provided
    const customPlanningKeywords = planningKeyword.trim()
      ? planningKeyword.toLowerCase().split(/[\s\-_,]+/).filter(word => word.length > 1)
      : [];
    
    const allKeywords = [...new Set([...clientKeywords, ...referenceKeywords, ...customPlanningKeywords])];
    
    // For each keyword, count matching interventions
    const matches = allKeywords.map(keyword => {
      const count = interventions.filter(intervention => 
        intervention.nomIntervention.toLowerCase().includes(keyword)
      ).length;
      
      return {
        keyword,
        interventionCount: count,
        enabled: enabledKeywords.has(keyword) || enabledKeywords.size === 0 || customPlanningKeywords.includes(keyword)
      };
    }).filter(match => match.interventionCount > 0); // Only keep keywords with matches
    
    return matches;
  }, [selectedClient, reference, planningKeyword, interventions, enabledKeywords]);

  // Initialize enabled keywords when client changes
  useMemo(() => {
    if (selectedClient && keywordMatches.length > 0 && enabledKeywords.size === 0) {
      setEnabledKeywords(new Set(keywordMatches.map(k => k.keyword)));
    }
  }, [selectedClient, keywordMatches]);

  const handleKeywordToggle = (keyword: string) => {
    const newKeywords = new Set(enabledKeywords);
    if (newKeywords.has(keyword)) {
      newKeywords.delete(keyword);
    } else {
      newKeywords.add(keyword);
    }
    setEnabledKeywords(newKeywords);
  };

  const filteredInterventions = useMemo(() => {
    if (!selectedClient) return [];
    
    const activeKeywords = enabledKeywords.size > 0 
      ? Array.from(enabledKeywords) 
      : keywordMatches.map(k => k.keyword);
    
    let filtered = interventions.filter(intervention => {
      const interventionName = intervention.nomIntervention.toLowerCase();
      
      // Check if any active keyword is found in the intervention name
      const matchesKeyword = activeKeywords.length === 0 || 
        activeKeywords.some(keyword => interventionName.includes(keyword));
      
      // Additional filter by planning keyword if provided
      const matchesPlanningKeyword = !planningKeyword || 
        interventionName.includes(planningKeyword.toLowerCase());
      
      const matchesDate = (!startDate || intervention.date >= startDate) && 
                         (!endDate || intervention.date <= endDate);
      return matchesKeyword && matchesPlanningKeyword && matchesDate;
    });

    // If AI has been run, prioritize high-scoring interventions but include manually selected ones
    if (aiScores.size > 0) {
      filtered = filtered.filter(intervention => {
        const score = aiScores.get(intervention.nomIntervention);
        const interventionId = getInterventionId(intervention);
        return (score && score.score >= 70) || selectedInterventions.has(interventionId);
      });
    }

    return filtered;
  }, [interventions, selectedClient, enabledKeywords, keywordMatches, planningKeyword, startDate, endDate, aiScores, selectedInterventions]);

  const filteredBilling = useMemo(() => {
    const filtered = billingItems.filter(item => {
      const matchesClient = !selectedClient || item.nomClient === selectedClient;
      const matchesDate = (!startDate || item.dateLivraison >= startDate) &&
                         (!endDate || item.dateLivraison <= endDate);
      const matchesFamily = articleFamilies.size === 0 || articleFamilies.has(item.familleArticle);

      // Filter by reference if provided
      const matchesReference = !reference ||
        (item.reference && item.reference.toLowerCase().includes(reference.toLowerCase()));

      // Additional filter by reference keyword if provided
      const matchesReferenceKeyword = !referenceKeyword ||
        (item.codeArticle && item.codeArticle.toLowerCase().includes(referenceKeyword.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(referenceKeyword.toLowerCase()));

      return matchesClient && matchesDate && matchesFamily && matchesReference && matchesReferenceKeyword;
    });

    return filtered.map(item => ({ ...item }));
  }, [billingItems, selectedClient, reference, referenceKeyword, startDate, endDate, articleFamilies]);

  // Filter purchase articles to only show families present in billing
  const filteredPurchaseArticles = useMemo(() => {
    if (purchaseArticles.length === 0) return [];
    
    const billingFamilies = new Set(
      filteredBilling.map(item => item.familleArticle.toLowerCase().trim())
    );
    
    return purchaseArticles.filter(article => 
      billingFamilies.has(article.famille.toLowerCase().trim())
    );
  }, [purchaseArticles, filteredBilling]);

  const interventionStats = useMemo(() => {
    if (interventionMode === "manual") {
      const totalHours = manualInterventionCount * manualHoursPerIntervention;
      return {
        count: manualInterventionCount,
        totalHours,
        hourlyCost: totalHours * hourlyRate,
      };
    }
    
    const interventionsToCount = filteredInterventions.filter(
      intervention => selectedInterventions.size === 0 || selectedInterventions.has(getInterventionId(intervention))
    );
    
    const totalHours = interventionsToCount.reduce((sum, intervention) => {
      return sum + calculateHoursFromTimeSlot(intervention.horaires);
    }, 0);
    
    return {
      count: interventionsToCount.length,
      totalHours,
      hourlyCost: totalHours * hourlyRate,
    };
  }, [filteredInterventions, selectedInterventions, hourlyRate, interventionMode, manualInterventionCount, manualHoursPerIntervention]);


  const handleInterventionToggle = (interventionId: string) => {
    const newSelected = new Set(selectedInterventions);
    if (newSelected.has(interventionId)) {
      newSelected.delete(interventionId);
    } else {
      newSelected.add(interventionId);
    }
    setSelectedInterventions(newSelected);
  };

  const handleAiMatch = async () => {
    if (!selectedClient || filteredInterventions.length === 0) {
      toast.error("Veuillez sélectionner un client et avoir des interventions");
      return;
    }

    setIsAiLoading(true);
    try {
      const searchContext = reference 
        ? `${selectedClient} (Référence: ${reference})`
        : selectedClient;
        
      const { data, error } = await supabase.functions.invoke('match-interventions', {
        body: {
          clientName: searchContext,
          interventionNames: filteredInterventions.map(i => i.nomIntervention)
        }
      });

      if (error) throw error;

      if (data?.matches) {
        const scoresMap = new Map<string, { score: number; reason: string }>(
          data.matches.map((m: any) => [m.name as string, { score: m.score as number, reason: m.reason as string }])
        );
        setAiScores(scoresMap);

        // Auto-select high-scoring interventions
        const highScoringIds = filteredInterventions
          .filter(intervention => {
            const score = scoresMap.get(intervention.nomIntervention);
            return score && score.score >= 70;
          })
          .map(intervention => getInterventionId(intervention));
        setSelectedInterventions(new Set(highScoringIds));

        toast.success(`${highScoringIds.length} interventions pertinentes détectées par l'IA`);
      }
    } catch (error: any) {
      console.error('Error matching interventions:', error);
      if (error.message?.includes('429')) {
        toast.error("Limite de requêtes atteinte, réessayez plus tard");
      } else if (error.message?.includes('402')) {
        toast.error("Crédits épuisés, ajoutez des crédits dans les paramètres");
      } else {
        toast.error("Erreur lors de l'analyse IA");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBillingItemToggle = (index: number) => {
    const newItems = [...filteredBilling];
    newItems[index].selected = !newItems[index].selected;
    
    const updatedAll = billingItems.map(item => {
      const matchingItem = newItems.find(ni => 
        ni.numeroFacture === item.numeroFacture && 
        ni.codeArticle === item.codeArticle
      );
      return matchingItem || item;
    });
    
    setBillingItems(updatedAll);
  };

  const handleArticleFamilyToggle = (family: string) => {
    const newFamilies = new Set(articleFamilies);
    if (newFamilies.has(family)) {
      newFamilies.delete(family);
    } else {
      newFamilies.add(family);
    }
    setArticleFamilies(newFamilies);
  };

  const handlePurchaseArticleToggle = (index: number) => {
    const newArticles = [...purchaseArticles];
    newArticles[index].selected = !newArticles[index].selected;
    setPurchaseArticles(newArticles);
  };

  const handlePurchaseAiMatch = async () => {
    if (!selectedClient || filteredBilling.length === 0 || purchaseArticles.length === 0) {
      toast.error("Veuillez avoir des articles de facturation et d'achat");
      return;
    }

    setIsPurchaseAiLoading(true);
    try {
      const billingDescriptions = filteredBilling.map(item => ({
        code: item.codeArticle,
        description: item.description,
        family: item.familleArticle
      }));
      
      const purchaseDescriptions = purchaseArticles.map(article => ({
        ref: article.refPsl,
        description: article.designationPsl,
        family: article.famille
      }));
        
      const { data, error } = await supabase.functions.invoke('match-purchase-articles', {
        body: {
          billingArticles: billingDescriptions,
          purchaseArticles: purchaseDescriptions
        }
      });

      if (error) throw error;

      if (data?.matches) {
        const scoresMap = new Map<string, { score: number; reason: string }>(
          data.matches.map((m: any) => [m.ref as string, { score: m.score as number, reason: m.reason as string }])
        );
        setPurchaseAiScores(scoresMap);

        // Auto-select high-scoring articles and link them
        const updatedArticles = purchaseArticles.map(article => {
          const score = scoresMap.get(article.refPsl);
          if (score && score.score >= 70) {
            const matchData = data.matches.find((m: any) => m.ref === article.refPsl);
            return {
              ...article,
              selected: true,
              matchedBillingCode: matchData?.matchedBillingCode || undefined
            };
          }
          return article;
        });
        setPurchaseArticles(updatedArticles);

        const highScoringCount = updatedArticles.filter(a => a.selected).length;
        toast.success(`${highScoringCount} articles pertinents détectés par l'IA`);
      }
    } catch (error: any) {
      console.error('Error matching purchase articles:', error);
      if (error.message?.includes('429')) {
        toast.error("Limite de requêtes atteinte, réessayez plus tard");
      } else if (error.message?.includes('402')) {
        toast.error("Crédits épuisés, ajoutez des crédits dans les paramètres");
      } else {
        toast.error("Erreur lors de l'analyse IA");
      }
    } finally {
      setIsPurchaseAiLoading(false);
    }
  };

  const financialResults = useMemo((): FinancialResults => {
    const selectedBillingTotal = billingMode === "manual"
      ? manualBillingAmount
      : filteredBilling.filter(item => item.selected).reduce((sum, item) => sum + item.montantTotalHT, 0);

    const laborCost = interventionStats.hourlyCost;
    const vehicleCost = interventionStats.totalHours * vehicleRate;
    const financialFee = selectedBillingTotal * (financialFeeRate / 100);
    const structureFee = selectedBillingTotal * (structureFeeRate / 100);

    const totalCost = laborCost + travelCost + vehicleCost + financialFee + structureFee;
    const totalHTBilled = selectedBillingTotal;
    const grossMargin = totalHTBilled - totalCost;
    const marginRate = totalHTBilled > 0 ? (grossMargin / totalHTBilled) * 100 : 0;

    // Calculate purchase articles cost if available (import or manual)
    const hasPurchaseData = purchaseArticles.length > 0 || purchaseMode === "manual";
    const purchaseArticlesCost = purchaseMode === "manual"
      ? manualPurchaseAmount
      : purchaseArticles.filter(a => a.selected).reduce((sum, a) => sum + a.prixAchatRetenu, 0);

    // Net margin = Total HT Billed - total cost - purchase articles cost
    const netMargin = hasPurchaseData
      ? totalHTBilled - totalCost - purchaseArticlesCost
      : undefined;

    return {
      totalHTBilled,
      interventionCost: laborCost,
      grossMargin,
      marginRate,
      travelCost,
      vehicleCost,
      financialFee,
      structureFee,
      totalCost,
      hasPurchaseData,
      purchaseArticlesCost: hasPurchaseData ? purchaseArticlesCost : undefined,
      netMargin,
    };
  }, [filteredBilling, billingMode, manualBillingAmount, interventionStats, travelCost, vehicleRate, financialFeeRate, structureFeeRate, purchaseArticles, purchaseMode, manualPurchaseAmount]);

  const hasData = (interventions.length > 0 || interventionMode === "manual") && (billingItems.length > 0 || billingMode === "manual");
  const hasSelection = interventionMode === "manual" || billingMode === "manual" || (selectedClient && (startDate || endDate));

  const displayMarginForHeader = financialResults.hasPurchaseData && financialResults.netMargin !== undefined
    ? financialResults.netMargin
    : financialResults.grossMargin;

  const formatNumber = (n: number, decimals = 0) =>
    n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">

      {/* STICKY HEADER */}
      <header className="shrink-0 z-40 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 max-w-[1600px]">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo + Title */}
            <div className="flex items-center gap-3 shrink-0 animate-slide-in-left">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center p-1 shadow-sm hover:scale-110 transition-transform duration-300">
                <img src={logoPSL} alt="PSL Sécurité Incendie" className="w-full h-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-foreground leading-tight">PSL - Rentabilité Client</h1>
                <p className="text-[10px] text-muted-foreground">Tableau de bord de profitabilité</p>
              </div>
            </div>

            {/* KPI mini-résumé */}
            {hasSelection && (
              <div className="hidden md:flex items-center gap-4 text-sm flex-1 justify-center animate-fade-in">
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
                  <span className="text-[10px] text-primary/70 uppercase font-medium">CA HT</span>
                  <span className="font-bold text-primary tabular-nums">{formatNumber(financialResults.totalHTBilled)}€</span>
                </div>
                <div className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Coût</span>
                  <span className="font-semibold tabular-nums">{formatNumber(financialResults.totalCost)}€</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full",
                  displayMarginForHeader >= 0 ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <span className={cn("text-[10px] uppercase font-medium", displayMarginForHeader >= 0 ? "text-success/70" : "text-destructive/70")}>Marge</span>
                  <span className={cn("font-bold tabular-nums", displayMarginForHeader >= 0 ? "text-success" : "text-destructive")}>
                    {formatNumber(displayMarginForHeader)}€
                  </span>
                </div>
              </div>
            )}

            {/* Settings button */}
            {hasData && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0 hover:bg-primary/10 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Paramètres</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[380px] sm:w-[480px] overflow-y-auto">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Paramètres des frais
                    </SheetTitle>
                  </SheetHeader>
                  <SettingsContent
                    includeLabor={includeLabor}
                    onToggleLabor={setIncludeLabor}
                    hourlyRate={hourlyRate}
                    onHourlyRateChange={setHourlyRate}
                    travelCost={travelCost}
                    onTravelCostChange={setTravelCost}
                    vehicleHours={interventionStats.totalHours}
                    onVehicleHoursChange={() => {}}
                    vehicleRate={vehicleRate}
                    onVehicleRateChange={setVehicleRate}
                    financialFeeRate={financialFeeRate}
                    onFinancialFeeRateChange={setFinancialFeeRate}
                    structureFeeRate={structureFeeRate}
                    onStructureFeeRateChange={setStructureFeeRate}
                  />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-[1600px] flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* SETUP STRIP */}
        <div className="py-3 border-b shrink-0">
          <div className="flex items-center gap-3 flex-wrap">

            {/* Step 1: Interventions */}
            <SetupStepChip
              step={1}
              label="Interventions"
              isUploaded={interventions.length > 0 || interventionMode === "manual"}
              fileName={interventionMode === "manual" ? "Saisie manuelle" : interventionsFileName}
            >
              <div className="space-y-3">
                <RadioGroup
                  value={interventionMode}
                  onValueChange={(v) => setInterventionMode(v as "import" | "manual")}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="import" id="chip-mode-import" />
                    <Label htmlFor="chip-mode-import" className="text-xs font-medium cursor-pointer">Import Excel</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="manual" id="chip-mode-manual" />
                    <Label htmlFor="chip-mode-manual" className="text-xs font-medium cursor-pointer">Saisie manuelle</Label>
                  </div>
                </RadioGroup>
                {interventionMode === "import" ? (
                  <FileUpload
                    compact
                    label="Planning des Interventions"
                    onFileSelect={handleInterventionsUpload}
                    isUploaded={interventions.length > 0}
                    fileName={interventionsFileName}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Nombre d'interventions</Label>
                      <Input
                        type="number" min={0}
                        value={manualInterventionCount}
                        onChange={(e) => setManualInterventionCount(parseInt(e.target.value) || 0)}
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Heures par intervention</Label>
                      <Input
                        type="number" min={0} step={0.5}
                        value={manualHoursPerIntervention}
                        onChange={(e) => setManualHoursPerIntervention(parseFloat(e.target.value) || 0)}
                        className="bg-background h-8 text-sm"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total : {manualInterventionCount * manualHoursPerIntervention}h → {(manualInterventionCount * manualHoursPerIntervention * hourlyRate).toFixed(2)}€
                    </p>
                  </div>
                )}
              </div>
            </SetupStepChip>

            {/* Step 2: Pièces clients */}
            <SetupStepChip
              step={2}
              label="Pièces clients"
              isUploaded={billingItems.length > 0 || billingMode === "manual"}
              fileName={billingMode === "manual" ? `Saisie manuelle — ${manualBillingAmount.toFixed(2)}€ HT` : billingFileName}
            >
              <div className="space-y-3">
                <RadioGroup
                  value={billingMode}
                  onValueChange={(v) => setBillingMode(v as "import" | "manual")}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="import" id="chip-billing-import" />
                    <Label htmlFor="chip-billing-import" className="text-xs font-medium cursor-pointer">Import Excel</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="manual" id="chip-billing-manual" />
                    <Label htmlFor="chip-billing-manual" className="text-xs font-medium cursor-pointer">Saisie manuelle</Label>
                  </div>
                </RadioGroup>
                {billingMode === "import" ? (
                  <FileUpload
                    compact
                    label="Détails des Pièces Clients"
                    onFileSelect={handleBillingUpload}
                    isUploaded={billingItems.length > 0}
                    fileName={billingFileName}
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">CA HT total (€)</Label>
                    <div className="relative">
                      <Input
                        type="number" min={0} step={0.01}
                        value={manualBillingAmount || ""}
                        onChange={(e) => setManualBillingAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-background h-8 text-sm pr-6"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                    </div>
                  </div>
                )}
              </div>
            </SetupStepChip>

            {/* Step 3: Articles d'achat */}
            <SetupStepChip
              step={3}
              label="Articles achat"
              isUploaded={purchaseArticles.length > 0 || purchaseMode === "manual"}
              fileName={purchaseMode === "manual" ? `Saisie manuelle — ${manualPurchaseAmount.toFixed(2)}€` : purchaseFileName}
            >
              <div className="space-y-3">
                <RadioGroup
                  value={purchaseMode}
                  onValueChange={(v) => setPurchaseMode(v as "import" | "manual")}
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="import" id="chip-purchase-import" />
                    <Label htmlFor="chip-purchase-import" className="text-xs font-medium cursor-pointer">Import Excel</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="manual" id="chip-purchase-manual" />
                    <Label htmlFor="chip-purchase-manual" className="text-xs font-medium cursor-pointer">Saisie manuelle</Label>
                  </div>
                </RadioGroup>
                {purchaseMode === "import" ? (
                  <FileUpload
                    compact
                    label="Articles en Stock (Achat)"
                    onFileSelect={handlePurchaseUpload}
                    isUploaded={purchaseArticles.length > 0}
                    fileName={purchaseFileName}
                  />
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Coût total des achats (€)</Label>
                    <div className="relative">
                      <Input
                        type="number" min={0} step={0.01}
                        value={manualPurchaseAmount || ""}
                        onChange={(e) => setManualPurchaseAmount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-background h-8 text-sm pr-6"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                    </div>
                  </div>
                )}
              </div>
            </SetupStepChip>

            <div className="ml-auto text-xs text-muted-foreground">
              {[interventions.length > 0 || interventionMode === "manual", billingItems.length > 0 || billingMode === "manual", purchaseArticles.length > 0 || purchaseMode === "manual"].filter(Boolean).length} / 3 étapes
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        {hasData && (
          <div className="shrink-0 z-30 bg-background/95 backdrop-blur-sm border-b">
            {/* Toggle row - toujours visible */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {selectedClient && <span className="font-medium text-foreground">{selectedClient}</span>}
                {startDate && <span>{startDate.toLocaleDateString('fr-FR')}</span>}
                {endDate && <span>→ {endDate.toLocaleDateString('fr-FR')}</span>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-7 px-2"
                onClick={() => setIsFilterBarVisible(v => !v)}
              >
                <Search className="w-3.5 h-3.5" />
                {isFilterBarVisible ? "Masquer filtres" : "Afficher filtres"}
                <span className={cn("transition-transform duration-200", isFilterBarVisible ? "rotate-180" : "")}>▾</span>
              </Button>
            </div>

            {/* Filtres repliables */}
            {isFilterBarVisible && (
              <div className="flex items-end gap-3 flex-wrap pb-2 animate-slide-down">
                <div className="min-w-[180px]">
                  <ClientSelector
                    clients={uniqueClients}
                    selectedClient={selectedClient}
                    onClientChange={(client) => {
                      setSelectedClient(client);
                      setEnabledKeywords(new Set());
                    }}
                  />
                </div>
                <div className="min-w-[140px]">
                  <ReferenceInput reference={reference} onReferenceChange={setReference} />
                </div>
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
                <div className="relative min-w-[160px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-9 text-sm"
                    placeholder="Mot-clé planning..."
                    value={planningKeyword}
                    onChange={(e) => setPlanningKeyword(e.target.value)}
                  />
                </div>
                <div className="relative min-w-[160px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-9 text-sm"
                    placeholder="Mot-clé pièces..."
                    value={referenceKeyword}
                    onChange={(e) => setReferenceKeyword(e.target.value)}
                  />
                </div>
                {selectedClient && keywordMatches.length > 0 && (
                  <KeywordSelector keywords={keywordMatches} onKeywordToggle={handleKeywordToggle} />
                )}
              </div>
            )}
          </div>
        )}

        {/* MAIN LAYOUT: Sidebar + Tabs */}
        {hasSelection && (
          <div className="flex flex-col lg:flex-row gap-4 py-4 flex-1 min-h-0 overflow-hidden animate-fade-in">

            {/* SIDEBAR KPI */}
            <div className="lg:w-[280px] shrink-0">
              <div className="lg:max-h-full lg:overflow-y-auto">
                <KpiSidebar
                  results={financialResults}
                  interventionCount={interventionStats.count}
                  totalHours={interventionStats.totalHours}
                  billingItemsCount={filteredBilling.filter(b => b.selected).length}
                  purchaseArticlesCount={purchaseArticles.filter(a => a.selected).length}
                />
              </div>
            </div>

            {/* TABS MAIN CONTENT */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              <Tabs defaultValue="billing">
                <TabsList className="mb-4 w-full justify-start h-auto flex-wrap gap-1">
                  <TabsTrigger value="billing" className="gap-1.5">
                    <FileText className="w-4 h-4" />
                    Pièces clients
                    {filteredBilling.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">{filteredBilling.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="interventions" className="gap-1.5">
                    <Users className="w-4 h-4" />
                    Interventions
                    <Badge variant="secondary" className="ml-1 text-xs">{interventionStats.count}</Badge>
                  </TabsTrigger>
                  {purchaseArticles.length > 0 && (
                    <TabsTrigger value="purchases" className="gap-1.5">
                      <Package className="w-4 h-4" />
                      Articles d'achat
                      <Badge variant="secondary" className="ml-1 text-xs">{filteredPurchaseArticles.length}</Badge>
                    </TabsTrigger>
                  )}
                  {filteredBilling.length > 0 && (
                    <TabsTrigger value="unique" className="gap-1.5">
                      <Package className="w-4 h-4" />
                      Articles uniques
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="billing" className="mt-0">
                  {filteredBilling.length > 0 ? (
                    <BillingCard
                      items={filteredBilling}
                      onItemToggle={handleBillingItemToggle}
                      articleFamilies={[...new Set(billingItems.filter(b => b.nomClient === selectedClient).map(b => b.familleArticle))]}
                      selectedFamilies={articleFamilies}
                      onFamilyToggle={handleArticleFamilyToggle}
                    />
                  ) : (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Aucune pièce client trouvée</p>
                      <p className="text-sm mt-1">Importez un fichier pièces clients ou ajustez les filtres</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="interventions" className="mt-0">
                  <InterventionsCard
                    count={interventionStats.count}
                    totalHours={interventionStats.totalHours}
                    hourlyCost={interventionStats.hourlyCost}
                    onOpenDialog={() => setIsInterventionsDialogOpen(true)}
                    onAiMatch={handleAiMatch}
                    isAiLoading={isAiLoading}
                  />
                </TabsContent>

                {purchaseArticles.length > 0 && (
                  <TabsContent value="purchases" className="mt-0">
                    <PurchaseArticlesCard
                      articles={filteredPurchaseArticles}
                      onArticleToggle={handlePurchaseArticleToggle}
                      onAiMatch={handlePurchaseAiMatch}
                      isAiLoading={isPurchaseAiLoading}
                      onOpenDialog={() => setIsPurchaseDialogOpen(true)}
                      aiScores={purchaseAiScores}
                    />
                  </TabsContent>
                )}

                {filteredBilling.length > 0 && (
                  <TabsContent value="unique" className="mt-0">
                    <UniqueArticlesCard items={filteredBilling} />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!hasData && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-6 flex items-center justify-center p-5 shadow-lg animate-float">
              <img src={logoPSL} alt="PSL Sécurité Incendie" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 animate-slide-up">Commencez votre analyse</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-base animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Importez vos fichiers Excel pour démarrer l'analyse de rentabilité
            </p>
          </div>
        )}
      </div>

      {/* DIALOGS */}
      <InterventionsDialog
        open={isInterventionsDialogOpen}
        onOpenChange={setIsInterventionsDialogOpen}
        interventions={filteredInterventions}
        selectedInterventions={selectedInterventions}
        onInterventionToggle={handleInterventionToggle}
        aiScores={aiScores}
      />

      <PurchaseArticlesDialog
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        articles={filteredPurchaseArticles}
        onArticleToggle={handlePurchaseArticleToggle}
        aiScores={purchaseAiScores}
      />

      <ColumnMappingDialog
        open={isMappingDialogOpen}
        onOpenChange={setIsMappingDialogOpen}
        headers={billingHeaders}
        sampleRows={billingSampleRows}
        mapping={billingColumnMapping}
        onConfirm={handleMappingConfirm}
      />
    </div>
  );
};

export default Index;

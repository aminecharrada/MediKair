import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ordersAPI } from "@/api";
import { useToast } from "@/hooks/use-toast";

interface ImportError {
  row: number;
  ref: string;
  message: string;
}

interface ImportResult {
  order?: { _id: string; orderNumber: string; totalPrice: number };
  imported: number;
  errors: ImportError[];
}

const CSV_TEMPLATE = `ref_produit;quantite
REF-001;2
REF-002;5
REF-003;1`;

export default function ImportCSVPage() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medikair-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows: string[][] = [];
    for (const line of lines) {
      rows.push(line.split(/[;,]/).map((c) => c.trim()));
    }
    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setPreviewRows(parseCSV(text));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setCsvText(text);
    if (text.trim()) {
      setPreviewRows(parseCSV(text));
    } else {
      setPreviewRows([]);
    }
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!csvText.trim()) {
      toast({ title: "Erreur", description: "Veuillez fournir des données CSV", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await ordersAPI.importCSV(csvText);
      setResult(res.data.data);
      toast({
        title: "Import terminé",
        description: res.data.message,
      });
    } catch (err: any) {
      toast({
        title: "Erreur d'import",
        description: err.response?.data?.message || "Erreur lors de l'import CSV",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Retour au dashboard
        </Link>

        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
          <h1 className="font-display text-xl font-bold sm:text-2xl">Import CSV</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Importez une commande depuis un fichier CSV avec les colonnes <strong>ref_produit</strong> et <strong>quantite</strong>
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Left: Upload & input */}
          <div className="space-y-4">
            {/* Template download */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h3 className="font-display text-sm font-bold sm:text-base">1. Télécharger le template</h3>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Utilisez ce modèle pour formater vos données correctement</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" /> Télécharger template CSV
              </Button>
            </div>

            {/* File upload */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h3 className="font-display text-sm font-bold sm:text-base">2. Charger votre fichier</h3>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-secondary/40 hover:bg-muted/30"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">{fileName || "Cliquez pour sélectionner un fichier CSV"}</p>
                <p className="text-xs text-muted-foreground">ou glissez-déposez votre fichier ici</p>
              </div>
            </div>

            {/* Manual text input */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h3 className="font-display text-sm font-bold sm:text-base">Ou collez directement les données</h3>
              <textarea
                className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-xs font-mono leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 sm:text-sm"
                rows={8}
                placeholder={`ref_produit;quantite\nREF-001;2\nREF-002;5`}
                value={csvText}
                onChange={(e) => handleTextChange(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !csvText.trim()}
              className="w-full bg-hero-gradient text-primary-foreground"
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Import en cours...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Importer la commande</>
              )}
            </Button>
          </div>

          {/* Right: Preview & results */}
          <div className="space-y-4">
            {/* Preview table */}
            {previewRows.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                <h3 className="font-display text-sm font-bold sm:text-base">Aperçu ({previewRows.length - 1} ligne{previewRows.length - 1 > 1 ? "s" : ""})</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 pr-4 text-left font-medium text-muted-foreground">#</th>
                        {previewRows[0]?.map((h, i) => (
                          <th key={i} className="pb-2 pr-4 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(1, 21).map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                          {row.map((cell, j) => (
                            <td key={j} className="py-2 pr-4">{cell}</td>
                          ))}
                        </tr>
                      ))}
                      {previewRows.length > 21 && (
                        <tr><td colSpan={previewRows[0].length + 1} className="py-2 text-center text-muted-foreground">
                          ... et {previewRows.length - 21} lignes de plus
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Import results */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                <h3 className="font-display text-sm font-bold sm:text-base">Résultat de l'import</h3>

                {result.order && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Commande créée : {result.order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{result.imported} produit(s) · {result.order.totalPrice?.toFixed(2)} TND</p>
                    </div>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">{result.errors.length} erreur(s)</span>
                    </div>
                    {result.errors.map((err, i) => (
                      <div key={i} className="rounded-lg bg-destructive/5 p-2 text-xs">
                        <span className="font-medium">Ligne {err.row}</span> ({err.ref}) : {err.message}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

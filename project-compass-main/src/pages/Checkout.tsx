import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";

const steps = [
  { id: 1, label: "Adresse", icon: MapPin },
  { id: 2, label: "Paiement", icon: CreditCard },
  { id: 3, label: "Confirmation", icon: CheckCircle2 },
];

const cartItems = [
  { product: products[0], qty: 3 },
  { product: products[3], qty: 5 },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Finaliser la commande</h1>

        {/* Stepper */}
        <div className="mt-5 flex items-center justify-center gap-1 sm:mt-6 sm:gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 sm:gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-9 sm:w-9 sm:text-sm ${
                step >= s.id ? "bg-hero-gradient text-primary-foreground" : "border border-border bg-card text-muted-foreground"
              }`}>
                {step > s.id ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : s.id}
              </div>
              <span className={`text-xs font-medium hidden sm:inline sm:text-sm ${step >= s.id ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`h-px w-6 sm:w-16 ${step > s.id ? "bg-secondary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-6 lg:mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                  <h2 className="font-display text-base font-bold flex items-center gap-2 sm:text-lg"><MapPin className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />Adresse de livraison</h2>
                  <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2">
                    <div><label className="text-xs font-medium sm:text-sm">Nom du cabinet</label><Input className="mt-1" placeholder="Cabinet Dentaire Fès Centre" /></div>
                    <div><label className="text-xs font-medium sm:text-sm">Contact</label><Input className="mt-1" placeholder="Dr. Ahmed Benali" /></div>
                    <div className="sm:col-span-2"><label className="text-xs font-medium sm:text-sm">Adresse</label><Input className="mt-1" placeholder="123 Avenue Hassan II" /></div>
                    <div><label className="text-xs font-medium sm:text-sm">Ville</label><Input className="mt-1" placeholder="Fès" /></div>
                    <div><label className="text-xs font-medium sm:text-sm">Code postal</label><Input className="mt-1" placeholder="30000" /></div>
                    <div><label className="text-xs font-medium sm:text-sm">Téléphone</label><Input className="mt-1" placeholder="+212 6 12 34 56 78" /></div>
                    <div><label className="text-xs font-medium sm:text-sm">Email</label><Input className="mt-1" placeholder="contact@cabinet.ma" /></div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-accent text-xs sm:mt-6 sm:p-4 sm:text-sm">
                    <p className="font-medium text-accent-foreground flex items-center gap-2"><Truck className="h-4 w-4" />Livraison estimée : 24-48h</p>
                    <p className="text-muted-foreground mt-1">Livraison gratuite à partir de 500 MAD</p>
                  </div>
                  <div className="mt-4 flex justify-end sm:mt-6">
                    <Button onClick={() => setStep(2)} className="w-full bg-hero-gradient text-primary-foreground sm:w-auto">Continuer <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                  <h2 className="font-display text-base font-bold flex items-center gap-2 sm:text-lg"><CreditCard className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />Mode de paiement</h2>
                  <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                    {["Virement bancaire", "Chèque", "Paiement à la livraison"].map((method) => (
                      <label key={method} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary/40 transition-colors sm:p-4">
                        <input type="radio" name="payment" className="h-4 w-4 accent-secondary" defaultChecked={method === "Virement bancaire"} />
                        <span className="font-medium text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-muted border border-border sm:mt-6 sm:p-4">
                    <h3 className="font-medium text-xs flex items-center gap-2 sm:text-sm"><Shield className="h-4 w-4 text-secondary" />Validation hiérarchique</h3>
                    <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Pour les commandes &gt; 5 000 MAD, une validation par le responsable sera requise.</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={() => setStep(1)} className="order-2 sm:order-1"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
                    <Button onClick={() => setStep(3)} className="order-1 sm:order-2 bg-hero-gradient text-primary-foreground">Confirmer <ArrowRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-xl border border-border bg-card p-6 shadow-card text-center sm:p-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent sm:h-16 sm:w-16">
                    <CheckCircle2 className="h-7 w-7 text-secondary sm:h-8 sm:w-8" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold sm:text-2xl">Commande confirmée !</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Votre commande <span className="font-semibold text-foreground">CMD-2026-0413</span> a été enregistrée.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Un email de confirmation a été envoyé.</p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                    <Link to="/commandes"><Button variant="outline" className="w-full sm:w-auto">Voir mes commandes</Button></Link>
                    <Link to="/catalogue"><Button className="w-full sm:w-auto bg-hero-gradient text-primary-foreground">Continuer mes achats</Button></Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6 lg:sticky lg:top-24">
              <h3 className="font-display text-sm font-bold sm:text-base">Récapitulatif</h3>
              <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 sm:gap-3">
                    <img src={item.product.image} alt={item.product.name} className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate sm:text-sm">{item.product.name}</p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">x{item.qty}</p>
                    </div>
                    <span className="text-xs font-semibold whitespace-nowrap sm:text-sm">{(item.product.price * item.qty).toFixed(2)} MAD</span>
                  </div>
                ))}
              </div>
              <dl className="mt-3 space-y-2 border-t border-border pt-3 text-xs sm:mt-4 sm:pt-4 sm:text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="font-medium">{subtotal.toFixed(2)} MAD</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Livraison</dt><dd className="font-medium">{shipping === 0 ? "Gratuite" : `${shipping} MAD`}</dd></div>
                <div className="flex justify-between border-t border-border pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-lg font-extrabold sm:text-xl">{total.toFixed(2)} MAD</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

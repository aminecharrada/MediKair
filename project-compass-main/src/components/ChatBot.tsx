import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
}

const initialMessages: Message[] = [
  { id: 1, role: "bot", text: "Bonjour ! 👋 Je suis l'assistant IA Medikair. Comment puis-je vous aider aujourd'hui ?" },
];

const botResponses: Record<string, string> = {
  "composite": "Nous avons plusieurs composites disponibles ! Le **Composite Universel Nano-Hybride** de DentaPro est notre best-seller à 42.50 MAD. Voulez-vous que je vous montre les options ?",
  "livraison": "Nous livrons sous **24-48h** sur tout le Maroc. La livraison est **gratuite** pour les commandes de plus de 500 MAD. 🚚",
  "prix": "Nos prix sont très compétitifs pour le marché B2B marocain. N'hésitez pas à me demander le prix d'un produit spécifique !",
  "implant": "Notre **Implant Conique Ti Grade 5** d'ImplantPro est disponible à 189 MAD. Surface SLA, connexion hexagonale interne. Excellent rapport qualité/prix !",
  "commande": "Pour passer commande, ajoutez vos produits au panier depuis le catalogue, puis suivez le processus de checkout. Besoin d'aide ?",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (lower.includes(key)) return response;
  }
  return "Merci pour votre message ! Je peux vous aider avec nos produits, prix, livraison et commandes. Que souhaitez-vous savoir ?";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, role: "bot", text: getBotResponse(userMsg.text) };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-secondary-foreground">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed z-50 flex flex-col overflow-hidden border border-border bg-card shadow-xl
              bottom-0 right-0 h-full w-full rounded-none
              sm:bottom-6 sm:right-6 sm:h-[480px] sm:w-[360px] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-hero-gradient px-4 py-3 safe-top">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/20">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary-foreground">Assistant Medikair</p>
                <p className="text-xs text-primary-foreground/70">IA · En ligne</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Bot className="h-3.5 w-3.5 text-accent-foreground" />
                  </div>
                  <div className="rounded-xl bg-muted px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 safe-bottom">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <Input placeholder="Posez votre question..." value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 text-sm" />
                <Button type="submit" size="icon" className="shrink-0 bg-hero-gradient text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

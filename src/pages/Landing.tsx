import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Scale,
  FileSearch,
  MessageSquare,
  TrendingDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Gavel,
  HeartHandshake,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold">
              S
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">Stankka</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#diferenciais" className="hover:text-foreground transition-colors">Diferenciais</a>
            <a href="#preco" className="hover:text-foreground transition-colors">Preço</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background flourish */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1100px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute top-40 right-10 h-[300px] w-[300px] rounded-full bg-accent/15 blur-[100px]" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Diagnóstico gratuito · Baseado em BACEN, CDC e Lei 14.181/2021
          </div>

          <h1 className="font-heading font-bold tracking-tight text-5xl md:text-7xl leading-[1.05] max-w-4xl mx-auto">
            Stankka:{" "}
            <span className="gradient-text">Menos juros.</span>
            <br />
            Mais vida.
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubra em minutos se seus juros estão acima da média do BACEN — e receba um plano
            de ação pronto para negociar, contestar ou reorganizar suas dívidas.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/login">
                Fazer meu diagnóstico grátis <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <a href="#como-funciona">Como funciona</a>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            81,7 milhões de brasileiros estão inadimplentes (Serasa, Q1/2026). Você não está sozinho.
          </p>

          {/* Hero stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { kpi: "R$ 9,99", label: "por dívida — sem mensalidade" },
              { kpi: "5 min", label: "para o diagnóstico completo" },
              { kpi: "100%", label: "baseado em regulação oficial" },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-xl border border-border/60 p-5 text-left"
              >
                <div className="font-heading font-bold text-2xl gradient-text">{s.kpi}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-3">
            <span className="h-px w-8 bg-primary/40" /> Como funciona <span className="h-px w-8 bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            Três passos. Zero promessa milagrosa.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stankka é infraestrutura. Quem negocia é você — com argumentos sólidos na mão.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: FileSearch,
              step: "01",
              title: "Diagnóstico grátis",
              body: "Cadastre suas dívidas (manual, fatura ou Open Finance). Comparamos cada taxa com a média BACEN e marcamos o que está abusivo.",
            },
            {
              icon: Scale,
              step: "02",
              title: "Plano de ação · R$ 9,99",
              body: "Por dívida, você desbloqueia o kit completo: carta de negociação, reclamação no consumidor.gov.br, BCB RDR, Procon e contraproposta Lei 14.181/2021.",
            },
            {
              icon: MessageSquare,
              step: "03",
              title: "Negocie e acompanhe",
              body: "Envie pelos canais oficiais. Acompanhe respostas, prazos e desfechos direto no painel — tudo registrado e em ordem.",
            },
          ].map(({ icon: Icon, step, title, body }) => (
            <Card key={step} className="glass-card border-border/60 hover:border-primary/40 transition-colors">
              <CardContent className="p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-heading font-bold text-3xl text-muted-foreground/30">{step}</span>
                </div>
                <h3 className="font-heading font-semibold text-xl">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section id="diferenciais" className="container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wider mb-3">
            <span className="h-px w-8 bg-primary/40" /> Por que Stankka <span className="h-px w-8 bg-primary/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            A regulação trabalha a seu favor
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              icon: TrendingDown,
              title: "Compara com a média BACEN",
              body: "Todo diagnóstico usa dados oficiais do Banco Central. Se sua taxa passa de 1,5× a média (Súmula 530/STJ), é abuso — e a gente te mostra como argumentar.",
            },
            {
              icon: ShieldCheck,
              title: "Mínimo existencial protegido",
              body: "Garantimos que nenhuma proposta comprometa seus R$ 600 mensais protegidos pelo Decreto 11.567/2023. Sua dignidade primeiro.",
            },
            {
              icon: Gavel,
              title: "Lei 14.181/2021 na prática",
              body: "Geramos contraproposta de superendividamento pronta para CEJUSC, com plano de pagamento de até 5 anos preservando o mínimo existencial.",
            },
            {
              icon: HeartHandshake,
              title: "Sem mensalidade. Sem pegadinha.",
              body: "R$ 9,99 por dívida — paga só quando quiser destravar o plano. Cada caso resolvido melhora o diagnóstico de outros brasileiros.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="glass-card border-border/60">
              <CardContent className="p-6 flex gap-4">
                <div className="h-11 w-11 shrink-0 rounded-xl gradient-primary flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading font-semibold text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing / What we are not */}
      <section id="preco" className="container max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Pricing */}
          <Card className="glass-card border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-3xl" />
            <CardContent className="p-8 space-y-5 relative">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> Modelo justo
              </div>
              <div>
                <div className="font-heading font-bold text-5xl">
                  R$ 9,99
                  <span className="text-base text-muted-foreground font-normal"> / dívida</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Diagnóstico sempre grátis. Você paga só quando quer destravar o plano de ação completo de uma dívida.
                </p>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Carta de negociação personalizada",
                  "Reclamação consumidor.gov.br pré-preenchida",
                  "Registro BCB (RDR) com fundamentação",
                  "Petição Procon (PAS) pronta",
                  "Contraproposta Lei 14.181/2021",
                  "Minuta de petição inicial JEC",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-full" asChild>
                <Link to="/login">Começar pelo diagnóstico grátis</Link>
              </Button>
            </CardContent>
          </Card>

          {/* What we are not */}
          <Card className="glass-card border-border/60">
            <CardContent className="p-8 space-y-5">
              <h3 className="font-heading font-bold text-2xl">
                O que a Stankka <em className="text-muted-foreground">não é</em>
              </h3>
              <p className="text-sm text-muted-foreground">
                Transparência total. Veja exatamente o que esperar — e o que não esperar — da gente.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  '"Limpa-nome" — não prometemos reparar score',
                  "Banco, financeira ou correspondente bancário",
                  "Escritório de advocacia ou despachante jurídico",
                  "Consolidação — não criamos nova dívida pra quitar antigas",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2.5 pt-2 border-t border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-medium">
                    Infraestrutura de defesa do consumidor: regulação, evidência e ação.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container max-w-4xl mx-auto px-4 py-20">
        <Card className="glass-card border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-[0.06]" />
          <CardContent className="p-10 md:p-14 text-center relative space-y-6">
            <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">
              Pronto para pagar <span className="gradient-text">menos juros</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              O diagnóstico é gratuito e leva menos de 5 minutos. Sem cartão, sem cadastro chato, sem promessa milagrosa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/login">
                  Começar agora <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border/60 mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-xs">
              S
            </div>
            <span className="font-heading font-semibold text-foreground">Stankka</span>
            <span className="opacity-60">· Menos juros. Mais vida.</span>
          </div>
          <div className="flex items-center gap-4 opacity-80">
            <span>stankka.com.br</span>
            <span>·</span>
            <span>LGPD</span>
            <span>·</span>
            <span>CDC</span>
            <span>·</span>
            <span>BACEN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

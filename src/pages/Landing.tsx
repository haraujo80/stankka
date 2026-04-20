import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Scale, FileSearch, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">S</div>
            <span className="font-heading font-bold text-lg">Stankka</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/login">Entrar</Link></Button>
            <Button asChild><Link to="/login">Começar grátis</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground mb-6">
          <ShieldCheck className="h-3.5 w-3.5" /> Diagnóstico gratuito · Sem promessa de “limpar nome”
        </div>
        <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight max-w-3xl mx-auto">
          Descubra se seus juros estão <span className="gradient-text">acima da média</span> — e o que fazer.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          A Stankka diagnostica suas dívidas com base na regulação do BACEN, no CDC e na jurisprudência.
          Você recebe um plano de ação pronto para usar — por <strong>R$ 9,99 por dívida</strong>.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild><Link to="/login">Fazer meu diagnóstico grátis</Link></Button>
          <Button size="lg" variant="outline" asChild><a href="#como-funciona">Como funciona</a></Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          81,7 milhões de brasileiros estão inadimplentes (Serasa, Q1/2026). Você não está sozinho.
        </p>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="container max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-heading font-bold text-center mb-12">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6 space-y-3">
              <FileSearch className="h-8 w-8 text-primary" />
              <h3 className="font-heading font-semibold text-lg">1. Diagnóstico grátis</h3>
              <p className="text-sm text-muted-foreground">
                Adicione suas dívidas (manual, upload de fatura ou Open Finance). A Stankka compara cada
                taxa com a média BACEN e marca o que parece abusivo ou ilegal.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 space-y-3">
              <Scale className="h-8 w-8 text-primary" />
              <h3 className="font-heading font-semibold text-lg">2. Plano de ação — R$ 9,99</h3>
              <p className="text-sm text-muted-foreground">
                Por dívida, você desbloqueia o kit completo: carta de negociação, reclamações pré-preenchidas
                (consumidor.gov.br, BCB, Procon) e contraproposta Lei 14.181/2021.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-6 space-y-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <h3 className="font-heading font-semibold text-lg">3. Negocie e acompanhe</h3>
              <p className="text-sm text-muted-foreground">
                Envie pelos canais oficiais e acompanhe respostas, prazos e desfechos. Cada caso resolvido
                ajuda a melhorar o diagnóstico de outros brasileiros.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What we are not */}
      <section className="container max-w-4xl mx-auto px-4 py-16">
        <Card className="glass-card border-primary/20">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-heading font-bold">O que a Stankka <em>não é</em></h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>❌ Não é “limpa-nome” (não promete reparar score)</li>
              <li>❌ Não é banco, financeira ou correspondente bancário</li>
              <li>❌ Não é escritório de advocacia nem despachante jurídico</li>
              <li>❌ Não faz consolidação (não cria nova dívida pra quitar as antigas)</li>
              <li>✅ É infraestrutura de defesa do consumidor: regulação, evidência e ação</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-8 text-center text-xs text-muted-foreground">
          Stankka · stankka.com.br · LGPD · CDC · BACEN
        </div>
      </footer>
    </div>
  );
}

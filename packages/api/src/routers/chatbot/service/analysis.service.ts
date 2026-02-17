import type { MessageAnalysis, MessageIntent } from "./service.types";

export class MessageAnalysisService {
  private readonly softwareKeywords = [
    "software",
    "app",
    "aplicacion",
    "aplicación",
    "web",
    "mobile",
    "movil",
    "móvil",
    "development",
    "desarrollo",
    "code",
    "codigo",
    "código",
    "api",
    "backend",
    "frontend",
    "fullstack",
    "react",
    "next",
    "node",
    "typescript",
    "golang",
    "docker",
    "kubernetes",
    "microservices",
    "microservicios",
    "cloud",
    "aws",
    "gcp",
    "devops",
    "ci/cd",
    "deploy",
    "despliegue",
    "base de datos",
    "database",
    "mongodb",
    "postgres",
    "plataforma",
    "platform",
    "saas",
    "landing",
    "ecommerce",
    "e-commerce",
    "tienda online",
    "pagina web",
    "página web",
    "sitio web",
  ];

  private readonly marketingKeywords = [
    "marketing",
    "seo",
    "sem",
    "social media",
    "redes sociales",
    "publicidad",
    "ads",
    "google ads",
    "facebook ads",
    "instagram",
    "content",
    "contenido",
    "branding",
    "marca",
    "growth",
    "crecimiento",
    "analytics",
    "analítica",
    "campaign",
    "campaña",
    "email marketing",
    "newsletter",
    "funnel",
    "embudo",
    "conversion",
    "conversión",
    "leads",
    "tráfico",
    "traffic",
  ];

  private readonly financeKeywords = [
    "finance",
    "finanzas",
    "inversión",
    "inversion",
    "investment",
    "money",
    "dinero",
    "capital",
    "blockchain",
    "web3",
    "crypto",
    "cripto",
    "token",
    "nft",
    "defi",
    "smart contract",
    "contrato inteligente",
    "solidity",
    "wallet",
    "billetera",
  ];

  private readonly bookingKeywords = [
    "reunión",
    "reunion",
    "meeting",
    "llamada",
    "call",
    "agendar",
    "schedule",
    "reservar",
    "book",
    "videollamada",
    "video call",
    "zoom",
    "meet",
    "consulta",
    "consultation",
    "demo",
    "presentación",
    "presentacion",
    "cita",
    "appointment",
  ];

  private readonly pricingKeywords = [
    "precio",
    "price",
    "costo",
    "cost",
    "cuanto",
    "cuánto",
    "how much",
    "tarifa",
    "rate",
    "cotización",
    "cotizacion",
    "quote",
    "presupuesto",
    "budget",
    "plan",
    "planes",
    "pricing",
    "paquete",
    "package",
    "inversión",
    "inversion",
  ];

  private readonly supportKeywords = [
    "problema",
    "problem",
    "error",
    "bug",
    "falla",
    "issue",
    "ayuda",
    "help",
    "soporte",
    "support",
    "no funciona",
    "not working",
    "urgente",
    "urgent",
    "ticket",
    "incidencia",
    "incident",
  ];

  private readonly greetingKeywords = [
    "hola",
    "hello",
    "hi",
    "hey",
    "buenos dias",
    "buenos días",
    "buenas tardes",
    "buenas noches",
    "good morning",
    "good afternoon",
    "good evening",
    "saludos",
    "greetings",
    "que tal",
    "qué tal",
  ];

  public analyze(message: string): MessageAnalysis {
    const rawText = (message || "").trim();

    if (!rawText) {
      return this.buildResult("unknown", 0.1, [], rawText);
    }

    const normalized = this.normalize(rawText);
    const lower = normalized.toLowerCase();
    const keywords: string[] = [];

    // Pure greeting check
    if (this.isGreetingOnly(lower)) {
      keywords.push("greeting");
      return this.buildResult("greeting", 0.6, keywords, rawText);
    }

    // Booking / meeting intent (highest priority)
    const bookingMatches = this.bookingKeywords.filter((kw) =>
      this.includesKeyword(lower, kw)
    );
    if (bookingMatches.length > 0) {
      keywords.push(...bookingMatches);
      const confidence = Math.min(1, 0.6 + bookingMatches.length * 0.1);
      return this.buildResult("booking_request", confidence, keywords, rawText);
    }

    // Pricing intent
    const pricingMatches = this.pricingKeywords.filter((kw) =>
      this.includesKeyword(lower, kw)
    );
    if (pricingMatches.length > 0) {
      keywords.push(...pricingMatches);
      const confidence = Math.min(1, 0.6 + pricingMatches.length * 0.1);
      return this.buildResult(
        "pricing_inquiry",
        confidence,
        keywords,
        rawText
      );
    }

    // Support intent
    const supportMatches = this.supportKeywords.filter((kw) =>
      this.includesKeyword(lower, kw)
    );
    if (supportMatches.length > 0) {
      keywords.push(...supportMatches);
      const confidence = Math.min(1, 0.55 + supportMatches.length * 0.1);
      return this.buildResult(
        "support_request",
        confidence,
        keywords,
        rawText
      );
    }

    // Software inquiry
    const softwareMatches = this.softwareKeywords.filter((kw) =>
      this.includesKeyword(lower, kw)
    );
    if (softwareMatches.length > 0) {
      keywords.push(...softwareMatches);
      const confidence = Math.min(1, 0.5 + softwareMatches.length * 0.08);
      return this.buildResult(
        "software_inquiry",
        confidence,
        keywords,
        rawText
      );
    }

    // Marketing inquiry
    const marketingMatches = this.marketingKeywords.filter((kw) =>
      this.includesKeyword(lower, kw)
    );
    if (marketingMatches.length > 0) {
      keywords.push(...marketingMatches);
      const confidence = Math.min(1, 0.5 + marketingMatches.length * 0.08);
      return this.buildResult(
        "marketing_inquiry",
        confidence,
        keywords,
        rawText
      );
    }

    // Finance / Web3 inquiry
    const financeMatches = this.financeKeywords.filter((kw) =>
      this.includesKeyword(lower, kw)
    );
    if (financeMatches.length > 0) {
      keywords.push(...financeMatches);
      const confidence = Math.min(1, 0.5 + financeMatches.length * 0.08);
      return this.buildResult(
        "finance_inquiry",
        confidence,
        keywords,
        rawText
      );
    }

    // Default: general info
    return this.buildResult("general_info", 0.4, keywords, rawText);
  }

  private buildResult(
    intent: MessageIntent,
    confidence: number,
    keywords: string[],
    rawText: string
  ): MessageAnalysis {
    return {
      intent,
      confidence,
      keywords: Array.from(new Set(keywords)),
      rawText,
    };
  }

  private isGreetingOnly(lowerMessage: string): boolean {
    const trimmed = lowerMessage.trim();
    if (!trimmed) return false;
    return this.greetingKeywords.some((keyword) => {
      const normalized = this.normalize(keyword).toLowerCase();
      return trimmed === normalized || trimmed.startsWith(`${normalized} `);
    });
  }

  private normalize(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private includesKeyword(message: string, keyword: string): boolean {
    const normalized = this.normalize(keyword).toLowerCase();
    return normalized.length > 0 && message.includes(normalized);
  }
}

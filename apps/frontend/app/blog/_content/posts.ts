export type BlogSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

export type BlogAuthor = {
  name: string
  role: string
}

export type BlogPostTranslations = {
  title: string
  description: string
  intro: string[]
  takeaways: string[]
  pullQuote: string
  sections: BlogSection[]
}

export type BlogPost = {
  slug: string
  publishedAt: string
  updatedAt: string
  readingTime: string
  category: string
  featured: boolean
  author: BlogAuthor
  tags: string[]
  seoKeywords: string[]
  en: BlogPostTranslations
  es: BlogPostTranslations
}

const fallbackSiteUrl = "https://www.alpadev.ai"

function resolveSiteUrl() {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  try {
    return new URL(envSiteUrl ?? fallbackSiteUrl)
  } catch {
    return new URL(fallbackSiteUrl)
  }
}

export const siteUrl = resolveSiteUrl()

const posts: BlogPost[] = [
  {
    slug: "the-next-ai-war-is-not-about-the-model-its-about-the-guardrails",
    publishedAt: "2026-03-26",
    updatedAt: "2026-03-26",
    readingTime: "8 min read",
    category: "AI Strategy",
    featured: true,
    author: {
      name: "Alpadev AI Editorial",
      role: "Software, AI & Cloud Strategy",
    },
    tags: ["AI Guardrails", "Amazon Bedrock", "Responsible AI", "AI Governance", "Enterprise AI", "AI Safety"],
    seoKeywords: [
      "AI guardrails 2026",
      "Amazon Bedrock Guardrails",
      "responsible AI",
      "AI governance enterprise",
      "AI safety production",
      "guardrails vs models",
      "AI content filtering",
      "automated reasoning AI",
    ],
    en: {
      title: "The Next AI War Is Not About the Model — It Is About the Guardrails",
      description: "AWS launches age-responsive, context-aware guardrails for Bedrock. Why the real competitive advantage in AI has shifted from intelligence to control, governance, and trust.",
      intro: [
        "On March 26, 2026, AWS published a detailed architecture for building age-responsive, context-aware AI applications using Amazon Bedrock Guardrails. On the surface, it is a technical how-to. Underneath, it signals something much larger: the AI industry has quietly moved past the model wars.",
        "For three years, labs competed on benchmarks, parameter counts, and reasoning scores. That race is not over, but the premium is shifting. The companies deploying AI at scale are no longer asking which model is smartest. They are asking which system can be trusted to operate safely in production, across contexts, with verifiable behavior.",
        "Guardrails are no longer a compliance checkbox. They are becoming the infrastructure layer that determines whether an AI system can ship to production at all. And the teams that treat governance as a first-class engineering problem — not an afterthought — are pulling ahead.",
      ],
      takeaways: [
        "The competitive moat in enterprise AI is shifting from model capability to operational trust: content safety, PII protection, hallucination prevention, and contextual grounding.",
        "Amazon Bedrock Guardrails now offers six configurable safeguard policies that work across any foundation model, including third-party models from OpenAI and Google.",
        "Automated Reasoning — formal logic applied to AI outputs — delivers 99% accuracy in hallucination detection, a capability no prompt engineering can match.",
        "Teams that embed guardrails into their AI stack from day one ship faster, not slower, because they eliminate the review bottlenecks that plague ungoverned deployments.",
      ],
      pullQuote: "The model gets you to the demo. The guardrails get you to production.",
      sections: [
        {
          title: "The Model Race Has a Diminishing Returns Problem",
          paragraphs: [
            "Every major lab now offers a model that can reason, write code, analyze documents, and hold multi-turn conversations. The gap between the best and second-best model on any given benchmark shrinks with every release cycle. For most production use cases, the difference between GPT-5.4, Claude Opus, and Gemini 3.1 is negligible compared to the difference between a governed deployment and an ungoverned one.",
            "This is the uncomfortable truth the industry is waking up to: model intelligence is becoming commoditized. What is not commoditized is the ability to deploy that intelligence safely at scale. Content moderation, PII redaction, prompt injection defense, hallucination prevention, contextual grounding — these are the capabilities that determine whether an AI feature survives contact with real users, real regulators, and real liability.",
            "The companies that understood this early — financial services, healthcare, government contractors — are now setting the pace. They did not wait for perfect models. They built the governance layer first and plugged models in as they matured.",
          ],
          bullets: [
            "Model performance differences on standard benchmarks have narrowed to single-digit percentages across top providers.",
            "Enterprise procurement increasingly evaluates AI vendors on safety certifications, audit trails, and governance tooling — not just accuracy.",
            "The cost of a hallucination in production (legal exposure, customer trust erosion, regulatory fines) far exceeds the cost of implementing guardrails.",
          ],
        },
        {
          title: "What Bedrock Guardrails Actually Does",
          paragraphs: [
            "Amazon Bedrock Guardrails is not a single feature. It is a composable safety layer with six distinct policy types that can be configured independently and applied to any model — including third-party models from OpenAI and Google via the ApplyGuardrail API. That cross-model compatibility is the strategic play: AWS is positioning guardrails as infrastructure, not a model-specific add-on.",
            "The six safeguard policies cover content moderation (hate speech, violence, sexual content, misconduct), prompt attack detection (injection and jailbreak attempts), topic classification (blocking responses on denied subjects), PII redaction (automatic removal of sensitive data from inputs and outputs), contextual grounding (ensuring responses stay faithful to provided context), and automated reasoning checks (formal logic validation of factual claims).",
            "The automated reasoning capability deserves special attention. It uses mathematical proof techniques to verify whether a model's output is consistent with its source material, delivering what AWS claims is 99% accuracy in hallucination detection. This is fundamentally different from statistical confidence scores. It is deterministic, auditable, and explainable — exactly what regulated industries need.",
          ],
          bullets: [
            "The ApplyGuardrail API works across any foundation model, not just Bedrock-hosted models.",
            "Content filtering blocks up to 88% of harmful content across text and image modalities.",
            "Automated Reasoning provides mathematically verifiable explanations, a first in production AI safety tooling.",
            "Recent updates extend protection to code elements, detecting malicious injection and PII exposure in code structures.",
          ],
        },
        {
          title: "Age-Responsive AI: Context Changes Everything",
          paragraphs: [
            "The AWS architecture published today goes beyond static guardrails. It demonstrates how to build AI systems that dynamically adjust their behavior based on user context — specifically age, but the pattern generalizes to any contextual signal: role, jurisdiction, risk profile, or authorization level.",
            "The architecture combines Bedrock Guardrails with DynamoDB for context storage and Lambda for dynamic policy selection. When a user interacts with the system, contextual metadata is retrieved in real time and the guardrail configuration is adjusted before the model generates a response. A query from a minor receives stricter content filtering than the same query from a verified adult professional.",
            "This is the pattern that enterprise AI has been missing. Static, one-size-fits-all safety policies either block too aggressively (frustrating legitimate users) or too permissively (exposing the organization to risk). Context-aware guardrails solve this by making safety proportional to actual risk, not theoretical worst-case scenarios.",
          ],
          bullets: [
            "Dynamic guardrail selection based on real-time context eliminates the false choice between safety and usability.",
            "The architecture pattern applies to any contextual dimension: user role, geographic jurisdiction, data sensitivity level, or regulatory requirement.",
            "DynamoDB + Lambda + Bedrock Guardrails provides a serverless, scalable implementation that adds minimal latency to the inference path.",
          ],
        },
        {
          title: "Why This Matters More Than the Next Model Release",
          paragraphs: [
            "Consider the current state of enterprise AI adoption. Most organizations have completed their proof-of-concept phase. They have identified use cases, tested models, and built prototypes. The bottleneck to production is almost never model capability. It is governance: Who approved this output? What happens if the model hallucinates? How do we prove compliance? What if a user manipulates the prompt?",
            "Guardrails directly address this bottleneck. Teams that embed safety infrastructure from the start can move features from prototype to production without the months-long review cycles that plague ungoverned deployments. The guardrails become the approval mechanism — auditable, configurable, and consistent across every interaction.",
            "This is why the competitive landscape is shifting. The advantage no longer belongs to the team with access to the most capable model. It belongs to the team that can deploy any model safely, observe its behavior, and prove to stakeholders that the system behaves as intended. That is an infrastructure problem, not a model problem.",
          ],
          bullets: [
            "Organizations report that governance review cycles, not model limitations, are the primary blocker to production AI deployment.",
            "Auditable guardrail logs serve as compliance evidence, reducing the burden on legal and security teams.",
            "Configurable policies allow the same AI system to serve different markets with different regulatory requirements without model changes.",
          ],
        },
        {
          title: "What High-Performing Teams Do Now",
          paragraphs: [
            "The practical takeaway is not to wait for guardrails to become mandatory. It is to treat them as a competitive advantage today. Teams that build governance into their AI stack from the beginning ship faster, face fewer production incidents, and earn stakeholder trust that compounds over time.",
            "Start by auditing your current AI deployments for the six risk categories that Bedrock Guardrails addresses: harmful content, prompt injection, off-topic responses, PII leakage, hallucination, and contextual drift. For each category, decide whether you are currently protected by engineering controls or by hope. Then close the gaps systematically.",
            "The teams that win the next phase of AI adoption will not be the ones chasing the latest model. They will be the ones that built the trust infrastructure first — and then moved fast because they could.",
          ],
          bullets: [
            "Audit every production AI endpoint for the six guardrail categories: content safety, prompt defense, topic control, PII, grounding, and factual accuracy.",
            "Implement guardrails as middleware, not as model-specific configurations — this lets you swap models without rebuilding safety.",
            "Design context-aware policies that adjust dynamically to user role, jurisdiction, and risk level.",
            "Treat guardrail logs as first-class telemetry: monitor trigger rates, false positive ratios, and coverage gaps.",
          ],
        },
      ],
    },
    es: {
      title: "La Próxima Guerra de la IA No Será por el Modelo — Será por los Guardrails",
      description: "AWS lanza guardrails adaptativos y conscientes del contexto para Bedrock. Por qué la verdadera ventaja competitiva en IA pasó de la inteligencia al control, la gobernanza y la confianza.",
      intro: [
        "El 26 de marzo de 2026, AWS publicó una arquitectura detallada para construir aplicaciones de IA adaptativas y conscientes del contexto usando Amazon Bedrock Guardrails. En la superficie, es un tutorial técnico. Por debajo, señala algo mucho más grande: la industria de IA ha superado silenciosamente la guerra de modelos.",
        "Durante tres años, los laboratorios compitieron en benchmarks, cantidad de parámetros y scores de razonamiento. Esa carrera no ha terminado, pero la prima se está desplazando. Las empresas que despliegan IA a escala ya no preguntan cuál modelo es más inteligente. Preguntan cuál sistema se puede confiar para operar de forma segura en producción, a través de contextos, con comportamiento verificable.",
        "Los guardrails ya no son un checkbox de cumplimiento. Se están convirtiendo en la capa de infraestructura que determina si un sistema de IA puede llegar a producción. Y los equipos que tratan la gobernanza como un problema de ingeniería de primera clase — no como algo para después — están tomando la delantera.",
      ],
      takeaways: [
        "La ventaja competitiva en IA empresarial se está desplazando de la capacidad del modelo a la confianza operativa: seguridad de contenido, protección de PII, prevención de alucinaciones y contextual grounding.",
        "Amazon Bedrock Guardrails ahora ofrece seis políticas de seguridad configurables que funcionan con cualquier modelo, incluyendo modelos de terceros como OpenAI y Google.",
        "Automated Reasoning — lógica formal aplicada a outputs de IA — entrega 99% de precisión en detección de alucinaciones, una capacidad que ningún prompt engineering puede igualar.",
        "Los equipos que integran guardrails en su stack de IA desde el día uno despliegan más rápido, no más lento, porque eliminan los cuellos de botella de revisión que plagan los despliegues sin gobernanza.",
      ],
      pullQuote: "El modelo te lleva al demo. Los guardrails te llevan a producción.",
      sections: [
        {
          title: "La carrera de modelos tiene un problema de retornos decrecientes",
          paragraphs: [
            "Todos los laboratorios principales ahora ofrecen un modelo que puede razonar, escribir código, analizar documentos y mantener conversaciones multi-turno. La brecha entre el mejor y el segundo mejor modelo en cualquier benchmark se reduce con cada ciclo de lanzamiento. Para la mayoría de los casos de uso en producción, la diferencia entre GPT-5.4, Claude Opus y Gemini 3.1 es insignificante comparada con la diferencia entre un despliegue gobernado y uno sin gobernanza.",
            "Esta es la verdad incómoda que la industria está descubriendo: la inteligencia del modelo se está comoditizando. Lo que no se comoditiza es la capacidad de desplegar esa inteligencia de forma segura a escala. Moderación de contenido, redacción de PII, defensa contra prompt injection, prevención de alucinaciones, contextual grounding — estas son las capacidades que determinan si una funcionalidad de IA sobrevive al contacto con usuarios reales, reguladores reales y responsabilidad legal real.",
            "Las empresas que entendieron esto temprano — servicios financieros, salud, contratistas gubernamentales — ahora marcan el ritmo. No esperaron al modelo perfecto. Construyeron la capa de gobernanza primero y conectaron modelos a medida que maduraban.",
          ],
          bullets: [
            "Las diferencias de rendimiento entre modelos en benchmarks estándar se han reducido a porcentajes de un solo dígito entre los principales proveedores.",
            "Las áreas de procurement empresarial evalúan cada vez más a los proveedores de IA por certificaciones de seguridad, rastros de auditoría y herramientas de gobernanza — no solo por precisión.",
            "El costo de una alucinación en producción (exposición legal, erosión de confianza del cliente, multas regulatorias) supera con creces el costo de implementar guardrails.",
          ],
        },
        {
          title: "Qué hace realmente Bedrock Guardrails",
          paragraphs: [
            "Amazon Bedrock Guardrails no es una sola funcionalidad. Es una capa de seguridad composable con seis tipos de política distintos que se pueden configurar independientemente y aplicar a cualquier modelo — incluyendo modelos de terceros de OpenAI y Google a través del API ApplyGuardrail. Esa compatibilidad cross-model es la jugada estratégica: AWS está posicionando los guardrails como infraestructura, no como un add-on específico de modelo.",
            "Las seis políticas cubren moderación de contenido (discurso de odio, violencia, contenido sexual, conducta indebida), detección de ataques al prompt (inyección y jailbreak), clasificación de temas (bloqueo de respuestas sobre temas prohibidos), redacción de PII (eliminación automática de datos sensibles de inputs y outputs), contextual grounding (asegurar que las respuestas se mantengan fieles al contexto proporcionado) y verificación por razonamiento automatizado (validación con lógica formal de afirmaciones factuales).",
            "La capacidad de razonamiento automatizado merece atención especial. Usa técnicas de prueba matemática para verificar si el output de un modelo es consistente con su material fuente, entregando lo que AWS dice es 99% de precisión en detección de alucinaciones. Esto es fundamentalmente distinto de los scores de confianza estadísticos. Es determinístico, auditable y explicable — exactamente lo que las industrias reguladas necesitan.",
          ],
          bullets: [
            "El API ApplyGuardrail funciona con cualquier modelo, no solo con modelos hospedados en Bedrock.",
            "El filtrado de contenido bloquea hasta el 88% del contenido dañino en modalidades de texto e imagen.",
            "Automated Reasoning proporciona explicaciones matemáticamente verificables, una primicia en herramientas de seguridad de IA en producción.",
            "Actualizaciones recientes extienden la protección a elementos de código, detectando inyección maliciosa y exposición de PII en estructuras de código.",
          ],
        },
        {
          title: "IA adaptativa: el contexto lo cambia todo",
          paragraphs: [
            "La arquitectura de AWS publicada hoy va más allá de guardrails estáticos. Demuestra cómo construir sistemas de IA que ajustan dinámicamente su comportamiento basándose en el contexto del usuario — específicamente edad, pero el patrón se generaliza a cualquier señal contextual: rol, jurisdicción, perfil de riesgo o nivel de autorización.",
            "La arquitectura combina Bedrock Guardrails con DynamoDB para almacenamiento de contexto y Lambda para selección dinámica de políticas. Cuando un usuario interactúa con el sistema, los metadatos contextuales se recuperan en tiempo real y la configuración del guardrail se ajusta antes de que el modelo genere una respuesta. Una consulta de un menor recibe filtrado de contenido más estricto que la misma consulta de un profesional adulto verificado.",
            "Este es el patrón que la IA empresarial ha estado necesitando. Las políticas de seguridad estáticas y universales o bloquean demasiado agresivamente (frustrando usuarios legítimos) o demasiado permisivamente (exponiendo a la organización a riesgos). Los guardrails conscientes del contexto resuelven esto haciendo que la seguridad sea proporcional al riesgo real, no a escenarios teóricos del peor caso.",
          ],
          bullets: [
            "La selección dinámica de guardrails basada en contexto en tiempo real elimina la falsa elección entre seguridad y usabilidad.",
            "El patrón de arquitectura aplica a cualquier dimensión contextual: rol del usuario, jurisdicción geográfica, nivel de sensibilidad de datos o requisito regulatorio.",
            "DynamoDB + Lambda + Bedrock Guardrails proporciona una implementación serverless y escalable que añade latencia mínima al camino de inferencia.",
          ],
        },
        {
          title: "Por qué esto importa más que el próximo lanzamiento de modelo",
          paragraphs: [
            "Considera el estado actual de la adopción empresarial de IA. La mayoría de las organizaciones han completado su fase de prueba de concepto. Han identificado casos de uso, probado modelos y construido prototipos. El cuello de botella para producción casi nunca es la capacidad del modelo. Es la gobernanza: ¿Quién aprobó este output? ¿Qué pasa si el modelo alucina? ¿Cómo demostramos cumplimiento? ¿Qué pasa si un usuario manipula el prompt?",
            "Los guardrails abordan directamente este cuello de botella. Los equipos que integran infraestructura de seguridad desde el inicio pueden mover funcionalidades de prototipo a producción sin los ciclos de revisión de meses que plagan los despliegues sin gobernanza. Los guardrails se convierten en el mecanismo de aprobación — auditable, configurable y consistente en cada interacción.",
            "Por esto el panorama competitivo está cambiando. La ventaja ya no pertenece al equipo con acceso al modelo más capaz. Pertenece al equipo que puede desplegar cualquier modelo de forma segura, observar su comportamiento y demostrar a los stakeholders que el sistema se comporta como se espera. Ese es un problema de infraestructura, no de modelo.",
          ],
          bullets: [
            "Las organizaciones reportan que los ciclos de revisión de gobernanza, no las limitaciones del modelo, son el bloqueador principal para desplegar IA en producción.",
            "Los logs auditables de guardrails sirven como evidencia de cumplimiento, reduciendo la carga sobre equipos legales y de seguridad.",
            "Las políticas configurables permiten que el mismo sistema de IA sirva diferentes mercados con diferentes requisitos regulatorios sin cambios de modelo.",
          ],
        },
        {
          title: "Lo que hacen los equipos de alto rendimiento ahora",
          paragraphs: [
            "La conclusión práctica no es esperar a que los guardrails sean obligatorios. Es tratarlos como una ventaja competitiva hoy. Los equipos que construyen gobernanza en su stack de IA desde el principio despliegan más rápido, enfrentan menos incidentes en producción y ganan confianza de stakeholders que se acumula con el tiempo.",
            "Empieza auditando tus despliegues actuales de IA para las seis categorías de riesgo que Bedrock Guardrails aborda: contenido dañino, inyección de prompts, respuestas fuera de tema, fuga de PII, alucinación y drift contextual. Para cada categoría, decide si actualmente estás protegido por controles de ingeniería o por esperanza. Después cierra las brechas sistemáticamente.",
            "Los equipos que ganen la próxima fase de adopción de IA no serán los que persigan el último modelo. Serán los que construyeron la infraestructura de confianza primero — y después se movieron rápido porque podían.",
          ],
          bullets: [
            "Audita cada endpoint de IA en producción para las seis categorías de guardrails: seguridad de contenido, defensa de prompts, control de temas, PII, grounding y precisión factual.",
            "Implementa guardrails como middleware, no como configuraciones específicas del modelo — esto te permite cambiar modelos sin reconstruir la seguridad.",
            "Diseña políticas conscientes del contexto que se ajusten dinámicamente al rol del usuario, jurisdicción y nivel de riesgo.",
            "Trata los logs de guardrails como telemetría de primera clase: monitorea tasas de activación, ratios de falsos positivos y brechas de cobertura.",
          ],
        },
      ],
    },
  },
  {
    slug: "the-end-of-sora-openai-shifts-to-agentic-ai",
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    readingTime: "7 min read",
    category: "AI Strategy",
    featured: true,
    author: {
      name: "Alpadev AI Editorial",
      role: "Digital Strategy",
    },
    tags: ["OpenAI", "Sora", "Agentic AI", "GPT-5.4", "Computer Use", "Tech Strategy"],
    seoKeywords: [
      "OpenAI closes Sora",
      "agentic AI 2026",
      "GPT-5.4 Computer Use",
      "future of AI",
      "OpenAI strategy shift",
      "AI video generation",
      "autonomous AI agents",
    ],
    en: {
      title: "The End of Sora: Why OpenAI is Abandoning Video to Conquer Autonomy",
      description: "OpenAI confirms the shutdown of Sora to concentrate all resources on GPT-5.4 and autonomous agents. What this means for teams building on AI in 2026.",
      intro: [
        "On March 25, 2026, OpenAI confirmed what many had suspected for months: Sora, its ambitious video generation model, is being shut down. The compute budget that once powered cinematic AI clips will be redirected entirely toward GPT-5.4 and the company's rapidly expanding Computer Use initiative.",
        "This is not a minor product sunset. It is a strategic pivot that reveals where the entire AI industry is heading. OpenAI is betting that the future belongs not to models that create media, but to models that operate software, navigate interfaces, and execute multi-step workflows with minimal human oversight.",
        "For teams building products, infrastructure, or operations on top of AI, this shift carries immediate implications. The question is no longer what AI can generate. It is what AI can reliably do.",
      ],
      takeaways: [
        "OpenAI is reallocating Sora's entire compute budget to GPT-5.4 and Computer Use, signaling that execution beats content generation.",
        "The shutdown reflects a broader industry consensus: agentic AI that can operate software is more valuable than AI that produces media.",
        "Computer Use capabilities allow models to interact with real interfaces, not just APIs, opening automation to legacy systems and manual workflows.",
        "Teams that build around agentic patterns today will have a structural advantage as these capabilities mature over the next 12 months.",
      ],
      pullQuote: "We are moving from an AI that simply suggests to an AI that acts. The era of passive intelligence is over.",
      sections: [
        {
          title: "Why Sora Had to Go",
          paragraphs: [
            "Sora launched in early 2024 to massive fanfare. The ability to generate photorealistic video from text prompts felt like a watershed moment. But behind the demos, the economics were brutal. Video generation required orders of magnitude more compute per request than text or code generation, and the monetization path never materialized at scale.",
            "By late 2025, internal reports suggested that Sora consumed roughly 15% of OpenAI's total GPU capacity while generating less than 2% of revenue. Meanwhile, enterprise customers were paying premium rates for GPT-based workflow automation, API integrations, and agentic task execution. The math became impossible to ignore.",
            "The decision to shut down Sora was not a failure of technology. It was a recognition that compute is the scarcest resource in AI, and every GPU-hour spent rendering video is a GPU-hour not spent on the capabilities that enterprises will actually pay for at scale.",
          ],
          bullets: [
            "Video generation required 10-50x more compute per request than equivalent text operations.",
            "Enterprise demand for agentic capabilities grew 340% year-over-year in 2025.",
            "The creator economy proved willing to pay for AI video, but not at the margins needed to justify the infrastructure.",
          ],
        },
        {
          title: "GPT-5.4 and the Computer Use Bet",
          paragraphs: [
            "The real story is not what OpenAI is shutting down, but what it is building. GPT-5.4, expected to ship in Q3 2026, will be the first model designed from the ground up for sustained computer interaction. Unlike previous models that responded to prompts in isolation, GPT-5.4 maintains persistent context across browsing sessions, application states, and multi-step operational workflows.",
            "Computer Use, the capability that allows models to see screens, move cursors, click buttons, and type into real interfaces, transforms the automation landscape. Instead of requiring custom API integrations for every tool, an agentic model can interact with any software the same way a human would. That includes legacy enterprise systems, internal tools with no API, and complex multi-application workflows.",
            "This is the unlock that makes agentic AI practical at scale. The bottleneck was never intelligence. It was the inability to interact with the messy, heterogeneous software environments where real work happens.",
          ],
          bullets: [
            "GPT-5.4 introduces persistent session context that survives across application switches and multi-hour workflows.",
            "Computer Use bridges the gap between AI capability and real-world software environments.",
            "Early partners report 60-80% reduction in manual data entry and cross-system reconciliation tasks.",
            "The model includes built-in guardrails for sensitive actions: confirmation prompts, rollback support, and audit logging.",
          ],
        },
        {
          title: "What This Means for Engineering Teams",
          paragraphs: [
            "If your team builds software products, this shift changes your competitive landscape. The companies that adapt fastest will be those that design their systems to work with agentic AI, not just for human users. That means clean interfaces, well-defined workflows, observable state, and clear permission boundaries.",
            "If your team operates infrastructure, the implications are equally significant. Autonomous agents that can navigate dashboards, read logs, execute runbooks, and escalate when confidence drops are no longer theoretical. They are arriving in production environments this year.",
            "The practical advice is simple: start mapping the workflows in your organization that are high-frequency, well-documented, and currently require a human to move data between systems or follow a checklist. Those are the first candidates for agentic automation.",
          ],
          bullets: [
            "Design systems with clear state boundaries and observable transitions that agents can follow.",
            "Instrument approval checkpoints for any workflow that touches production data or customer-facing systems.",
            "Treat agent permissions like you treat service account permissions: scoped, audited, and revocable.",
            "Build rollback paths into every automated workflow before you build the happy path.",
          ],
        },
        {
          title: "The Competitive Landscape Reshuffles",
          paragraphs: [
            "OpenAI's pivot puts pressure on every company in the AI space. Anthropic has been building toward agentic use cases with Claude's tool use and computer interaction capabilities. Google DeepMind is integrating Gemini into Workspace and Cloud operations. Microsoft is embedding Copilot agents across the entire 365 and Azure ecosystem.",
            "The convergence is unmistakable: every major AI lab is racing to build models that can do things, not just say things. Video generation, image creation, and content production are becoming commoditized capabilities. The premium is shifting to reliability, safety, and operational competence.",
            "For startups and mid-market companies, this creates both risk and opportunity. The risk is building on capabilities that are about to become table stakes. The opportunity is that agentic AI dramatically lowers the cost of automating workflows that were previously only accessible to companies with large engineering teams.",
          ],
        },
        {
          title: "What Comes Next",
          paragraphs: [
            "The shutdown of Sora is a signal, not an endpoint. Over the next 12 to 18 months, expect to see agentic capabilities move from impressive demos to production infrastructure. The models will get better at maintaining context, recovering from errors, and knowing when to ask for help.",
            "The teams that win in this next phase are not necessarily the ones with the most advanced AI. They are the ones with the cleanest operational foundations: well-documented processes, observable systems, clear governance, and the organizational willingness to let software handle the work that software should handle.",
            "We are entering the era of AI that operates. The question for every team is whether their systems are ready to be operated.",
          ],
          bullets: [
            "Expect production-grade agentic tooling from major vendors by Q4 2026.",
            "Regulatory frameworks for autonomous AI actions in enterprise settings are being drafted now.",
            "The talent premium is shifting from prompt engineering to agent architecture and operational design.",
            "Companies that start piloting agentic workflows today will have 12-18 months of learning advantage.",
          ],
        },
      ],
    },
    es: {
      title: "El Fin de Sora: Por qué OpenAI abandona el video para conquistar la Autonomía",
      description: "OpenAI confirma el cierre de Sora para concentrar todos los recursos en GPT-5.4 y agentes autónomos. Qué significa esto para los equipos que construyen sobre IA en 2026.",
      intro: [
        "El 25 de marzo de 2026, OpenAI confirmó lo que muchos sospechaban desde hace meses: Sora, su ambicioso modelo de generación de video, será desactivado. El presupuesto de cómputo que alimentaba clips cinematográficos generados por IA será redirigido por completo hacia GPT-5.4 y la iniciativa de Computer Use.",
        "No se trata de un cierre menor de producto. Es un giro estratégico que revela hacia dónde se dirige toda la industria de IA. OpenAI está apostando a que el futuro no pertenece a los modelos que crean contenido multimedia, sino a los que operan software, navegan interfaces y ejecutan flujos de trabajo complejos con mínima supervisión humana.",
        "Para equipos que construyen productos, infraestructura u operaciones sobre IA, este cambio tiene implicaciones inmediatas. La pregunta ya no es qué puede generar la IA. Es qué puede hacer de forma confiable.",
      ],
      takeaways: [
        "OpenAI reasigna todo el presupuesto de cómputo de Sora a GPT-5.4 y Computer Use, señalando que la ejecución supera a la generación de contenido.",
        "El cierre refleja un consenso más amplio en la industria: la IA agéntica que opera software es más valiosa que la IA que produce contenido multimedia.",
        "Las capacidades de Computer Use permiten a los modelos interactuar con interfaces reales, no solo APIs, abriendo la automatización a sistemas legacy y flujos manuales.",
        "Los equipos que adopten patrones agénticos hoy tendrán una ventaja estructural a medida que estas capacidades maduren en los próximos 12 meses.",
      ],
      pullQuote: "Estamos pasando de una IA que simplemente sugiere a una IA que actúa. La era de la inteligencia pasiva terminó.",
      sections: [
        {
          title: "Por qué Sora tenía que desaparecer",
          paragraphs: [
            "Sora se lanzó a principios de 2024 con una recepción masiva. La capacidad de generar video fotorrealista a partir de prompts de texto parecía un momento histórico. Pero detrás de las demos, la economía era brutal. La generación de video requería órdenes de magnitud más cómputo por solicitud que la generación de texto o código, y la monetización nunca se materializó a escala.",
            "Para finales de 2025, reportes internos sugerían que Sora consumía aproximadamente el 15% de la capacidad total de GPUs de OpenAI mientras generaba menos del 2% de los ingresos. Mientras tanto, los clientes empresariales pagaban tarifas premium por automatización de flujos de trabajo, integraciones API y ejecución de tareas agénticas. Las matemáticas se volvieron imposibles de ignorar.",
            "La decisión de cerrar Sora no fue un fracaso tecnológico. Fue el reconocimiento de que el cómputo es el recurso más escaso en IA, y cada hora de GPU dedicada a renderizar video es una hora que no se invierte en las capacidades por las que las empresas realmente pagarán a escala.",
          ],
          bullets: [
            "La generación de video requería 10-50x más cómputo por solicitud que las operaciones de texto equivalentes.",
            "La demanda empresarial de capacidades agénticas creció un 340% interanual en 2025.",
            "La economía de creadores demostró disposición a pagar por video IA, pero no a los márgenes necesarios para justificar la infraestructura.",
          ],
        },
        {
          title: "GPT-5.4 y la apuesta por Computer Use",
          paragraphs: [
            "La verdadera historia no es lo que OpenAI cierra, sino lo que está construyendo. GPT-5.4, previsto para Q3 2026, será el primer modelo diseñado desde cero para interacción sostenida con computadoras. A diferencia de modelos anteriores que respondían a prompts de forma aislada, GPT-5.4 mantiene contexto persistente entre sesiones de navegación, estados de aplicación y flujos de trabajo operativos de múltiples pasos.",
            "Computer Use, la capacidad que permite a los modelos ver pantallas, mover cursores, hacer clic en botones y escribir en interfaces reales, transforma el panorama de la automatización. En lugar de requerir integraciones API personalizadas para cada herramienta, un modelo agéntico puede interactuar con cualquier software de la misma forma que lo haría un humano. Esto incluye sistemas empresariales legacy, herramientas internas sin API y flujos de trabajo complejos entre múltiples aplicaciones.",
            "Este es el punto de inflexión que hace viable la IA agéntica a escala. El cuello de botella nunca fue la inteligencia. Era la incapacidad de interactuar con los entornos de software heterogéneos y caóticos donde ocurre el trabajo real.",
          ],
          bullets: [
            "GPT-5.4 introduce contexto de sesión persistente que sobrevive entre cambios de aplicación y flujos de trabajo de varias horas.",
            "Computer Use cierra la brecha entre la capacidad de la IA y los entornos de software del mundo real.",
            "Socios tempranos reportan una reducción del 60-80% en entrada manual de datos y tareas de conciliación entre sistemas.",
            "El modelo incluye barandillas integradas para acciones sensibles: prompts de confirmación, soporte de rollback y registro de auditoría.",
          ],
        },
        {
          title: "Qué significa para los equipos de ingeniería",
          paragraphs: [
            "Si tu equipo construye productos de software, este cambio altera tu panorama competitivo. Las empresas que se adapten más rápido serán las que diseñen sus sistemas para funcionar con IA agéntica, no solo para usuarios humanos. Eso significa interfaces limpias, flujos de trabajo bien definidos, estado observable y límites claros de permisos.",
            "Si tu equipo opera infraestructura, las implicaciones son igualmente significativas. Agentes autónomos que pueden navegar dashboards, leer logs, ejecutar runbooks y escalar cuando la confianza baja ya no son teóricos. Están llegando a entornos de producción este año.",
            "El consejo práctico es simple: empieza a mapear los flujos de trabajo en tu organización que son de alta frecuencia, están bien documentados y actualmente requieren que un humano mueva datos entre sistemas o siga una checklist. Esos son los primeros candidatos para automatización agéntica.",
          ],
          bullets: [
            "Diseña sistemas con límites de estado claros y transiciones observables que los agentes puedan seguir.",
            "Instrumenta puntos de aprobación para cualquier flujo que toque datos de producción o sistemas orientados al cliente.",
            "Trata los permisos de agentes como tratas los permisos de cuentas de servicio: con alcance definido, auditados y revocables.",
            "Construye caminos de rollback en cada flujo automatizado antes de construir el happy path.",
          ],
        },
        {
          title: "El panorama competitivo se reordena",
          paragraphs: [
            "El giro de OpenAI presiona a todas las empresas del espacio de IA. Anthropic ha estado construyendo hacia casos de uso agénticos con las capacidades de uso de herramientas e interacción con computadoras de Claude. Google DeepMind está integrando Gemini en Workspace y operaciones Cloud. Microsoft está embebiendo agentes Copilot en todo el ecosistema de 365 y Azure.",
            "La convergencia es inconfundible: todos los principales laboratorios de IA están compitiendo por construir modelos que puedan hacer cosas, no solo decir cosas. La generación de video, creación de imágenes y producción de contenido se están convirtiendo en capacidades comoditizadas. La prima se está desplazando hacia la confiabilidad, la seguridad y la competencia operativa.",
            "Para startups y empresas medianas, esto crea tanto riesgo como oportunidad. El riesgo es construir sobre capacidades que están a punto de convertirse en commodities. La oportunidad es que la IA agéntica reduce drásticamente el costo de automatizar flujos de trabajo que antes solo eran accesibles para empresas con grandes equipos de ingeniería.",
          ],
        },
        {
          title: "Lo que viene después",
          paragraphs: [
            "El cierre de Sora es una señal, no un punto final. En los próximos 12 a 18 meses, espera ver capacidades agénticas pasar de demos impresionantes a infraestructura de producción. Los modelos mejorarán en mantener contexto, recuperarse de errores y saber cuándo pedir ayuda.",
            "Los equipos que ganen en esta próxima fase no son necesariamente los que tengan la IA más avanzada. Son los que tengan las bases operativas más limpias: procesos bien documentados, sistemas observables, gobernanza clara y la voluntad organizacional de dejar que el software maneje el trabajo que el software debería manejar.",
            "Estamos entrando en la era de la IA que opera. La pregunta para cada equipo es si sus sistemas están listos para ser operados.",
          ],
          bullets: [
            "Espera herramientas agénticas de grado productivo de los principales proveedores para Q4 2026.",
            "Los marcos regulatorios para acciones autónomas de IA en entornos empresariales se están redactando ahora.",
            "La prima de talento se está desplazando de la ingeniería de prompts hacia la arquitectura de agentes y el diseño operativo.",
            "Las empresas que comiencen a pilotear flujos agénticos hoy tendrán 12-18 meses de ventaja en aprendizaje.",
          ],
        },
      ],
    },
  },
  {
    slug: "2026-tech-landscape-agentic-ai-autonomous-infrastructure",
    publishedAt: "2026-03-18",
    updatedAt: "2026-03-18",
    readingTime: "9 min read",
    category: "AI Strategy",
    featured: true,
    author: {
      name: "Alpadev AI Editorial",
      role: "Software, AI & Cloud Strategy",
    },
    tags: [
      "Agentic AI",
      "Platform Engineering",
      "Autonomous Infrastructure",
      "Cloud Operations",
      "Governance",
    ],
    seoKeywords: [
      "agentic AI",
      "autonomous infrastructure",
      "2026 tech landscape",
      "platform engineering",
      "AI governance",
      "self-healing systems",
      "observability",
      "cloud automation",
    ],
    en: {
      title: "The 2026 Tech Landscape: Agentic AI & Autonomous Infrastructure",
      description: "Why 2026 belongs to teams that pair agentic AI with self-managing platforms, stronger guardrails, and software operations designed for autonomous change.",
      intro: [
        "The most important software trend in 2026 is not that AI can generate more content, write more code, or answer more questions. It is that AI systems are increasingly able to execute work across tools, environments, and operational boundaries with limited human intervention.",
        "That shift matters because it changes the job of modern software teams. The new challenge is no longer just shipping digital products faster. It is building operating environments where intelligent systems can act safely, infrastructure can recover automatically, and critical workflows remain observable from end to end.",
      ],
      takeaways: [
        "Agentic AI is moving from suggestion engines to bounded operators that can plan, act, and escalate when confidence drops.",
        "Infrastructure is becoming increasingly autonomous through policy-driven automation, continuous remediation, and richer operational context.",
        "The winning stack combines intelligence with traceability, governance, and human override paths designed into the runtime.",
      ],
      pullQuote: "The winning stack in 2026 is not just intelligent. It is accountable, observable, and able to recover without heroics.",
      sections: [
        {
          title: "From Assistants to Operators",
          paragraphs: [
            "In the previous wave, most AI products behaved like copilots: they suggested, summarized, or accelerated a single user in a single interface. In 2026, the center of gravity is shifting toward agents that can coordinate across ticketing systems, knowledge bases, developer tooling, cloud APIs, and business workflows.",
            "That does not mean fully autonomous software everywhere. It means the best teams are decomposing work into bounded operating loops: collect context, propose a plan, execute approved actions, verify the result, and surface an audit trail. The result is software that behaves less like a chatbot and more like a disciplined teammate.",
          ],
          bullets: [
            "Agents increasingly manage routine triage, incident enrichment, back-office workflows, and first-pass operations.",
            "Human review remains essential at approval boundaries, policy exceptions, and high-impact production changes.",
            "Product teams now design task scope, tool permissions, and fallback behavior as carefully as they design UI.",
          ],
        },
        {
          title: "Autonomous Infrastructure Stops Being Optional",
          paragraphs: [
            "As systems become more distributed, reactive operations no longer scale. Engineering organizations are leaning harder into infrastructure defined as software, policy encoded as guardrails, and remediation pipelines that trigger before an incident becomes customer-visible.",
            "Autonomous infrastructure is not a single product category. It is an operating model that combines platform engineering, infrastructure as code, event-driven automation, runtime policy enforcement, and service-level objectives. The aim is simple: reduce the amount of operational stability that depends on expert memory and manual intervention.",
          ],
          bullets: [
            "Provisioning, scaling, and rollback processes are increasingly policy-aware and event-triggered.",
            "Self-healing patterns now extend beyond restart logic to include dependency rerouting, drift correction, and controlled degradation.",
            "Platform teams are becoming internal product teams for reliability, compliance, and developer velocity.",
          ],
        },
        {
          title: "Observability Becomes Decision Intelligence",
          paragraphs: [
            "Telemetry in 2026 is no longer just about dashboards. It is about giving both humans and agents the context required to make good decisions. Logs, traces, metrics, cost signals, and model behavior need to converge into an operational narrative, not remain scattered across disconnected tools.",
            "This is where mature teams pull ahead. They are instrumenting workflows so an agent can determine not only what happened, but what changed, what risk is attached to the change, and which actions are allowed next. Better visibility does not merely improve debugging; it enables safer autonomy.",
          ],
          bullets: [
            "Observability pipelines increasingly include model quality, prompt lineage, and automation outcomes alongside system metrics.",
            "Incident response improves when agents can retrieve relevant traces, affected services, runbooks, and ownership context instantly.",
            "Cost intelligence becomes part of reliability strategy as teams optimize both performance and operating margin.",
          ],
        },
        {
          title: "Governance Moves Into the Runtime",
          paragraphs: [
            "The more autonomy you introduce, the more important runtime governance becomes. Static policies and annual reviews are not enough when intelligent systems can touch production workflows, sensitive data, and customer-facing experiences in real time.",
            "Leading teams are embedding governance directly into execution paths. Identity, permissions, approval checkpoints, policy tests, and immutable activity logs are becoming first-class product requirements. Governance is no longer a drag on speed when it is designed as software from the beginning.",
          ],
          bullets: [
            "Every agent action needs a clear identity, a bounded scope, and a recoverable trail.",
            "Sensitive workflows benefit from human-in-the-loop checkpoints rather than blanket denial of automation.",
            "Regulated environments increasingly demand explainability for both infrastructure behavior and AI-assisted actions.",
          ],
        },
        {
          title: "What High-Performing Teams Do Next",
          paragraphs: [
            "The practical path forward is not to automate everything. It is to choose high-friction workflows where context is available, policies are clear, and success criteria can be measured. Teams that win in this landscape start with a contained loop, instrument it deeply, and expand autonomy only when reliability proves out.",
            "In other words, 2026 rewards operational discipline. The organizations that benefit most from agentic AI are not necessarily the ones with the flashiest demos. They are the ones that pair software craftsmanship with infrastructure rigor and treat autonomy as an engineering system, not a marketing feature.",
          ],
          bullets: [
            "Map repeatable workflows before you automate them.",
            "Design guardrails, rollback paths, and manual override states up front.",
            "Measure outcomes in latency, quality, reliability, and operator time recovered.",
            "Scale autonomy gradually, one trusted operating loop at a time.",
          ],
        },
      ],
    },
    es: {
      title: "El Panorama Tech 2026: IA Agéntica e Infraestructura Autónoma",
      description: "Por qué el 2026 pertenece a los equipos que combinan IA agéntica con plataformas autogestionadas, barandillas más fuertes y operaciones de software diseñadas para el cambio autónomo.",
      intro: [
        "La tendencia de software más importante de 2026 no es que la IA pueda generar más contenido, escribir más código o responder más preguntas. Es que los sistemas de IA son cada vez más capaces de ejecutar trabajo a través de herramientas, entornos y fronteras operativas con intervención humana limitada.",
        "Ese cambio importa porque transforma el trabajo de los equipos de software modernos. El nuevo desafío ya no es simplemente entregar productos digitales más rápido. Es construir entornos operativos donde los sistemas inteligentes puedan actuar de forma segura, la infraestructura pueda recuperarse automáticamente y los flujos de trabajo críticos permanezcan observables de extremo a extremo.",
      ],
      takeaways: [
        "La IA agéntica está pasando de motores de sugerencias a operadores acotados que pueden planificar, actuar y escalar cuando la confianza baja.",
        "La infraestructura se está volviendo cada vez más autónoma a través de automatización basada en políticas, remediación continua y contexto operativo más rico.",
        "El stack ganador combina inteligencia con trazabilidad, gobernanza y caminos de override humano diseñados en el runtime.",
      ],
      pullQuote: "El stack ganador en 2026 no es solo inteligente. Es responsable, observable y capaz de recuperarse sin heroísmos.",
      sections: [
        {
          title: "De Asistentes a Operadores",
          paragraphs: [
            "En la ola anterior, la mayoría de los productos de IA se comportaban como copilotos: sugerían, resumían o aceleraban a un solo usuario en una sola interfaz. En 2026, el centro de gravedad se está desplazando hacia agentes que pueden coordinar entre sistemas de tickets, bases de conocimiento, herramientas de desarrollo, APIs cloud y flujos de trabajo empresariales.",
            "Eso no significa software totalmente autónomo en todas partes. Significa que los mejores equipos están descomponiendo el trabajo en bucles operativos acotados: recopilar contexto, proponer un plan, ejecutar acciones aprobadas, verificar el resultado y presentar un rastro de auditoría. El resultado es software que se comporta menos como un chatbot y más como un compañero de equipo disciplinado.",
          ],
          bullets: [
            "Los agentes gestionan cada vez más el triage rutinario, el enriquecimiento de incidentes, flujos de back-office y operaciones de primer paso.",
            "La revisión humana sigue siendo esencial en fronteras de aprobación, excepciones de política y cambios de producción de alto impacto.",
            "Los equipos de producto ahora diseñan el alcance de las tareas, los permisos de herramientas y el comportamiento de fallback con el mismo cuidado que diseñan la UI.",
          ],
        },
        {
          title: "La Infraestructura Autónoma deja de ser opcional",
          paragraphs: [
            "A medida que los sistemas se vuelven más distribuidos, las operaciones reactivas ya no escalan. Las organizaciones de ingeniería se están apoyando más en la infraestructura definida como software, las políticas codificadas como barandillas y los pipelines de remediación que se activan antes de que un incidente sea visible para el cliente.",
            "La infraestructura autónoma no es una categoría de producto única. Es un modelo operativo que combina ingeniería de plataforma, infraestructura como código, automatización basada en eventos, enforcement de políticas en runtime y objetivos de nivel de servicio. El objetivo es simple: reducir la cantidad de estabilidad operativa que depende de la memoria experta y la intervención manual.",
          ],
          bullets: [
            "Los procesos de provisioning, escalado y rollback son cada vez más conscientes de políticas y activados por eventos.",
            "Los patrones de auto-curación ahora se extienden más allá de la lógica de reinicio para incluir re-enrutamiento de dependencias, corrección de drift y degradación controlada.",
            "Los equipos de plataforma se están convirtiendo en equipos de producto internos para confiabilidad, cumplimiento y velocidad de desarrollo.",
          ],
        },
        {
          title: "La Observabilidad se convierte en Inteligencia de Decisiones",
          paragraphs: [
            "La telemetría en 2026 ya no se trata solo de dashboards. Se trata de dar tanto a humanos como a agentes el contexto requerido para tomar buenas decisiones. Los logs, trazas, métricas, señales de costo y comportamiento de modelos necesitan converger en una narrativa operativa, no permanecer dispersos en herramientas desconectadas.",
            "Aquí es donde los equipos maduros toman la delantera. Están instrumentando flujos de trabajo para que un agente pueda determinar no solo qué pasó, sino qué cambió, qué riesgo está asociado al cambio y qué acciones están permitidas a continuación. Una mejor visibilidad no solo mejora el debugging; habilita una autonomía más segura.",
          ],
          bullets: [
            "Los pipelines de observabilidad incluyen cada vez más la calidad del modelo, el linaje de prompts y los resultados de automatización junto con las métricas del sistema.",
            "La respuesta a incidentes mejora cuando los agentes pueden recuperar trazas relevantes, servicios afectados, runbooks y contexto de ownership al instante.",
            "La inteligencia de costos se convierte en parte de la estrategia de confiabilidad mientras los equipos optimizan tanto el rendimiento como el margen operativo.",
          ],
        },
        {
          title: "La Gobernanza se mueve al Runtime",
          paragraphs: [
            "Cuanta más autonomía introduces, más importante se vuelve la gobernanza en runtime. Las políticas estáticas y las revisiones anuales no son suficientes cuando los sistemas inteligentes pueden tocar flujos de trabajo de producción, datos sensibles y experiencias orientadas al cliente en tiempo real.",
            "Los equipos líderes están embebiendo la gobernanza directamente en los caminos de ejecución. Identidad, permisos, checkpoints de aprobación, tests de política y logs de actividad inmutables se están convirtiendo en requisitos de producto de primera clase. La gobernanza ya no es un freno a la velocidad cuando se diseña como software desde el principio.",
          ],
          bullets: [
            "Cada acción de agente necesita una identidad clara, un alcance acotado y un rastro recuperable.",
            "Los flujos de trabajo sensibles se benefician de checkpoints human-in-the-loop en lugar de la denegación total de automatización.",
            "Los entornos regulados demandan cada vez más explicabilidad tanto para el comportamiento de infraestructura como para las acciones asistidas por IA.",
          ],
        },
        {
          title: "Lo que hacen los equipos de alto rendimiento",
          paragraphs: [
            "El camino práctico no es automatizar todo. Es elegir flujos de trabajo de alta fricción donde el contexto está disponible, las políticas son claras y los criterios de éxito se pueden medir. Los equipos que ganan en este panorama comienzan con un bucle contenido, lo instrumentan profundamente y expanden la autonomía solo cuando la confiabilidad se demuestra.",
            "En otras palabras, 2026 recompensa la disciplina operativa. Las organizaciones que más se benefician de la IA agéntica no son necesariamente las que tienen las demos más llamativas. Son las que combinan la artesanía de software con el rigor de infraestructura y tratan la autonomía como un sistema de ingeniería, no como una característica de marketing.",
          ],
          bullets: [
            "Mapea los flujos de trabajo repetibles antes de automatizarlos.",
            "Diseña barandillas, caminos de rollback y estados de override manual desde el inicio.",
            "Mide resultados en latencia, calidad, confiabilidad y tiempo de operador recuperado.",
            "Escala la autonomía gradualmente, un bucle operativo confiable a la vez.",
          ],
        },
      ],
    },
  },
]

export function getBlogPosts() {
  return posts.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

export function getBlogPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug)
}

function parseBlogDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)

  if (!match) {
    return new Date(date)
  }

  const [, year, month, day] = match

  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
}

export function formatBlogDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(parseBlogDate(date))
  } catch {
    return date
  }
}

export function getSectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
}

export function getBlogPostUrl(slug: string) {
  return new URL("/blog/" + slug, siteUrl).toString()
}

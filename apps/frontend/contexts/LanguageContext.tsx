"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Services
    "nav.services": "Services",
    "nav.solutions": "Solutions",
    "nav.plans": "Engagement",
    "nav.testimonials": "Selected Work",
    "nav.contact": "Availability",
    "nav.home": "Home",
    "nav.faq": "FAQ",

    // Hero
    "hero.badge": "Critical Systems. Solved.",
    "hero.description": "Custom-built digital foundations for enterprises that demand perfection.",
    "hero.cta.primary": "Speak with an Architect.",
    "hero.cta.secondary": "Let's Talk",
    
    // The Approach (Features)
    "features.title": "Impact. Not Hours.",
    "features.hero.title": "Vision",
    "bento.title": "The Engine",
  
    "features.software.title": "Insight",
    "features.software.description": "The Audit. Radical clarity. We deconstruct your architecture to expose the bottleneck. We isolate friction and resolve it. Your system, fully optimized.",
  
    "features.ai.title": "Velocity",
    "features.ai.description": "The Build. Rapid engineering with Go and Rust. We deliver vertical, production-ready value every single sprint. Transparent code. No black boxes. Just results.",
  
    "features.cloud.title": "Ownership",
    "features.cloud.description": "The Transfer. We deliver capability, not just code. Comprehensive documentation and training ensure you command the system. You own the machine we built.",
  
    "features.blockchain.title": "Defense",
    "features.blockchain.description": "Zero Trust standard. Military-grade encryption and automated audits guard your core. We protect your assets. Security is not optional. It is absolute.",

    // Stats
    "stats.title": "Scale Your Vision. Secure Your Revenue.",
    "stats.subtitle": "We transform complex architecture into assets that simply work. No downtime. Just growth.",
    "stats.years": "Years of Global Experience",
    "stats.countries": "Countries Served",
    "stats.projects": "Enterprise Deployments",
    "stats.satisfaction": "Client Retention Rate",

    // Bento Grid
    "bento.title": "The Engine.",
    "bento.subtitle": "Robust. Type-Safe. Unbreakable.",
    "bento.mobile.title": "Cross-Platform Native",
    "bento.mobile.description": "React Native & Expo for iOS/Android. Native modules, 60fps animations, and shared core logic.",
    "bento.performance.title": "High Performance",
    // Selected Work (StickyShowcase)
    "work.case1.industry": "Fintech / Payments",
    "work.case1.challenge": "Legacy monolithic payments engine causing 40% latency on Black Friday.",
    "work.case1.outcome": "99.99% Uptime & 200ms transaction finality at 10k TPS.",
    
    "work.case2.industry": "Enterprise SaaS / Logistics",
    "work.case2.challenge": "Disconnected fleet data preventing real-time routing decisions.",
    "work.case2.outcome": "$2M/year saved in fuel costs via AI-driven route optimization.",
    
    "work.case3.industry": "Fintech / Infrastructure",
    "work.case3.challenge": "Compliance bottlenecks stalling high-frequency trading platform launch.",
    "work.case3.outcome": "Zero-Trust hybrid cloud deployed. 500% throughput increase & SEC approval.",
    "bento.apis.title": "Type-Safe APIs",
    "bento.apis.description": "End-to-end type safety with tRPC. High-throughput communication via gRPC and REST.",

    // Testimonials
    "testimonials.title": "Global Partnerships",
    "testimonials.subtitle": "Leading companies across 3 continents trust our architectural vision.",
    "testimonial.miguel.location": "Malaga, Spain",
    "testimonial.miguel.quote": "Alejandro is a rare talent. His architectural vision for our international platform was flawless. He doesn't just write code; he engineers solutions that anticipate future scale.",
    "testimonial.sofia.location": "Medellin, Colombia",
    "testimonial.sofia.quote": "A true senior engineer. Alejandro's professionalism and technical depth transformed our workflow. His code is clean, documented, and incredibly robust.",
    "testimonial.camila.location": "Buenos Aires, Argentina",
    "testimonial.camila.quote": "We needed a complex fintech solution, and Alpadev delivered. The strategic insight combined with hands-on coding expertise made our launch a massive success.",
    "testimonial.cindy.location": "Cartagena, Colombia",
    "testimonial.cindy.quote": "The custom accounting system Alpadev built is the backbone of our operations. Flawless execution and attention to detail rarely seen.",
    "testimonial.daniela.location": "Chicago, USA",
    "testimonial.daniela.quote": "Alejandro is a powerhouse. He delivered enterprise-grade fullstack solutions with remarkable speed. His proactive ownership makes him feel like a co-founder.",
    "testimonial.yassine.location": "Paris, France",
    "testimonial.yassine.quote": "Our e-commerce conversion jumped 40% thanks to Alejandro's optimization. His grasp of React internals and performance tuning is world-class.",
    "testimonial.andres.location": "Barcelona, Spain",
    "testimonial.andres.quote": "We launched our mobile app 3 weeks early. Alejandro's mastery of React Native and agile processes is the gold standard for remote engineering.",
    "testimonial.edvard.location": "Oslo, Norway",
    "testimonial.edvard.quote": "Alpadev brought modern cloud architecture to our legacy systems. Secure, fast, and transparent. The best technical partner we've had.",
    "testimonial.gabriel.location": "Barranquilla, Colombia",
    "testimonial.gabriel.quote": "Our SaaS wouldn't exist without Alejandro. His ability to handle fullstack complexity—from DB schema to UI animations—is unmatched.",

    // Pricing
    "pricing.program.title": "Pricing",
    "pricing.program.subtitle": "Flexible collaboration tailored to your technical roadmap.",
    "pricing.title": "Flexible plans for",
    "pricing.titleHighlight": "technical growth",
    "pricing.subtitle": "Scale your team with senior expertise.",
    "pricing.yearly": "Annual",
    "pricing.monthly": "Monthly",
    
    // Tier 1: Fractional Core
    "pricing.parttime.title": "Fractional Core",
    "pricing.parttime.description": "Precision capacity. 20 hours/week of senior engineering focused on high-leverage features.",
    "pricing.parttime.cta": "Start Fractional",
    "pricing.feature1.pt": "20h Weekly Capacity",
    "pricing.feature2.pt": "Async & Sync Comms",
    "pricing.feature3.pt": "Feature Development",
    "pricing.feature4.pt": "Code Review Lead",
    "pricing.feature5.pt": "Direct Technical Access",
    "pricing.feature6.pt": "Architecture Documentation",
    "pricing.feature7.pt": "Cloud Deployment (AWS)",

    // Tier 2: Total Velocity
    "pricing.fulltime.title": "Total Velocity",
    "pricing.fulltime.description": "Full immersion. 40 hours/week. We embed deeply into your workflow to ship faster. No friction.",
    "pricing.fulltime.cta": "Deploy Full Team",
    "pricing.feature1.ft": "40h Weekly Dedication",
    "pricing.feature2.ft": "Real-time Collaboration",
    "pricing.feature3.ft": "Full Architecture Ownership",
    "pricing.feature4.ft": "Priority Response",
    "pricing.feature5.ft": "Lead QA & Best Practices",
    "pricing.feature6.ft": "CI/CD & DevOps Pipeline",
    "pricing.feature7.ft": "Advanced Web3 Solutions",

    // Tier 3: Strategic Advisory
    "pricing.consulting.title": "Strategic Advisory",
    "pricing.consulting.description": "Surgical intervention. We solve complex architectural bottlenecks and security risks. On demand.",
    "pricing.consulting.cta": "Book a Briefing",
    "pricing.feature1.cs": "Architecture Audits",
    "pricing.feature2.cs": "Security Hardening",
    "pricing.feature3.cs": "Team Mentorship",
    "pricing.feature4.cs": "Legacy Migration Plans",
    "pricing.feature5.cs": "Database Optimization",
    "pricing.feature6.cs": "Disaster Recovery Planning",
    "pricing.feature7.cs": "Executive Tech Briefing",

    "pricing.custom": "Need a specialized squad?",
    "pricing.customLink": "Let's discuss your roadmap",
    "pricing.perMonth": "USD / mo",
    "pricing.perYear": "USD / yr",
    "pricing.perHour": "USD / hr",

    // FAQ
    "faq.title": "Technical",
    "faq.titleHighlight": "Q&A",
    "faq.subtitle": "Answers about our stack, methodology, and engagement process.",
    "faq.cta": "Chat on WhatsApp",
    "faq.q1.title": "What is your primary tech stack?",
    "faq.q1.content": "We specialize in modern ecosystem: React, Next.js, TypeScript, Golang, and Python (AI). For infrastructure, we use AWS/GCP, Docker, Kubernetes, and Terraform. For data, PostgreSQL, Redis, and MongoDB. We choose tools that guarantee type-safety and scalability.",
    "faq.q2.title": "How do you handle project timeline?",
    "faq.q2.content": "We use agile sprints. A typical MVP takes 4-8 weeks. Enterprise modules take 3-6 months. We provide a detailed technical roadmap with milestones before writing a single line of code.",
    "faq.q3.title": "Do you work with international clients?",
    "faq.q3.content": "Yes, 80% of our clients are in the US and Europe. We are fluent in English and Spanish, adept at async communication, and align with your timezone for critical syncs.",
    "faq.q4.title": "What about post-launch support?",
    "faq.q4.content": "We offer SLA-backed maintenance. This covers security patches, dependency updates, uptime monitoring, and scaling support. We do not just ship and vanish.",
    "faq.q5.title": "How do you ensure code quality?",
    "faq.q5.content": "Strict enforcement of linting, type-checking, and testing (Unit/E2E). We use CI/CD pipelines to block bad merges. Code reviews are mandatory. We write code that other engineers love to read.",
    "faq.q6.title": "What are the engagement models?",
    "faq.q6.content": "Fixed-scope for defined projects, Retainer for ongoing Fraction CTO/Dev roles, or Time & Materials for consulting audits. We are flexible to your burn rate and needs.",
    "faq.q7.title": "Can you build AI agents?",
    "faq.q7.content": "Yes. We implement LLM-based autonomous agents using LangChain, OpenAI/Anthropic APIs, and vector databases. We build systems that can 'think', reason, and execute tasks, not just chatbots.",
    "faq.q8.title": "Do you do Smart Contracts?",
    "faq.q8.content": "Yes. We develop and audit Solidity smart contracts for Ethereum and L2s. We handle token standards (ERC20/721), wallet connections (Wagmi/Viem), and safe contract interaction patterns.",

    // Call to Action
    "cta.title": "Availability is Limited.",
    "cta.subtitle": "We currently accept 2 new partnerships per quarter to maintain our standard of involvement. Please detail your technical roadmap below.",
    "cta.button": "Request Consultation",
    "cta2.title": "Initialize Your Transformation",
    "cta2.subtitle": "Fill out the intake form. We'll analyze your requirements and propose a high-level architecture within 24 hours.",
    "cta2.primary": "Start Now",
    "cta2.secondary": "View Portfolio",

    // Footer
    "footer.solutions": "Services",
    "footer.legal": "Legal",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.rights": "All rights reserved.",
    "footer.madeBy": "Engineered by Alpadev",

    // Section
    "section.subtitle": "Custom-built digital foundations for enterprises that demand perfection.",
    "section.title": "Software. Solved.",
    "section.description": "We design and deploy bespoke software ecosystems for enterprises that cannot afford downtime.",
    "section.feature1.title": "Consistency and transformation",
    "section.feature1.description": "We integrate with your team to build a foundation of stability and innovation. With proven frameworks and agile methodologies, we drive your technological and strategic growth: solid, scalable and ready for the next challenges.",
    "section.feature2.title": "Shared objectives",
    "section.feature2.description": "From day one, your goals are ours. With close collaboration, transparent communication and clear KPIs, we unlock operational efficiencies and increase profitability: every project becomes a measurable result.",
    "section.feature3.title": "B2B and B2C",
    "section.feature3.description": "Whether you sell to businesses or consumers, we design omnichannel strategies that capture new markets. From demand generation to loyalty, our custom solutions drive balanced growth.",
    
    // Forms
    "form.title": "Send us your request",
    "form.subtitle": "Fill out the form and we will contact you soon",
    "form.name": "Full name",
    "form.namePlaceholder": "Enter your full name",
    "form.email": "Email",
    "form.emailPlaceholder": "your@email.com",
    "form.phone": "Phone",
    "form.phonePlaceholder": "+1 234 567 8900",
    "form.message": "Message",
    "form.messagePlaceholder": "Describe your inquiry",
    "form.submit": "Send Request",
    "form.submitting": "Sending...",
    "form.subject": "Subject",
    "form.subjectPlaceholder": "Brief description of the subject",
    "form.description": "Description",
    "form.descriptionPlaceholder": "Describe your request in as much detail as possible",
    "form.type": "Request type",
    "form.typePlaceholder": "Select type",
    "form.priority": "Priority",
    "form.priorityPlaceholder": "Select priority",
    "form.typeTicket": "Support Ticket",
    "form.typeTicketDesc": "Report a problem or request help",
    "form.typeQuote": "Request Quote",
    "form.typeQuoteDesc": "Get information about pricing and services",
    "form.typeOther": "Other",
    "form.typeOtherDesc": "Other inquiry or request",
    "form.priorityLow": "Low",
    "form.priorityLowDesc": "Not urgent",
    "form.priorityMedium": "Medium",
    "form.priorityMediumDesc": "Normal priority",
    "form.priorityHigh": "High",
    "form.priorityHighDesc": "Requires prompt attention",
    "form.priorityCritical": "Critical",
    "form.priorityCriticalDesc": "Urgent - requires immediate attention",
    "form.errorNameShort": "Name must be at least 2 characters",
    "form.errorEmailInvalid": "Invalid email",
    "form.errorPhoneShort": "Phone must be at least 8 characters",
    "form.errorSubjectShort": "Subject must be at least 5 characters",
    "form.errorDescriptionShort": "Description must be at least 10 characters",

    // Newsletter
    "newsletter.title": "Subscribe to our newsletter",
    "newsletter.description": "Stay updated with the latest news, insights, and exclusive content from our team. No spam, just valuable content delivered to your inbox.",
    "newsletter.emailLabel": "Email address",
    "newsletter.emailPlaceholder": "Enter your email",
    "newsletter.subscribe": "Subscribe",
    "newsletter.feature1.title": "Weekly articles",
    "newsletter.feature1.description": "Get the latest insights and industry trends delivered straight to your inbox every week.",
    "newsletter.feature2.title": "No spam",
    "newsletter.feature2.description": "We respect your privacy and will never share your email or send unwanted messages.",

    // Preserved Keys found in existing code
    "vision.restructure.title": "Vision & Restructuring",
    "vision.restructure.description": "We don't just sell services; we restructure companies. We align technology, creative strategy, and sales operations to create a unified growth engine.",
    "vision.restructure.tech": "Technology",
    "vision.restructure.creative": "Creative Strategy",
    "vision.restructure.sales": "Sales Operations",
    "faq.cta": "Contact us on WhatsApp",
    "footer.madeBy": "Powered by: Alpadev.xyz",
    "trustedBy.title": "Trusted by innovative companies", // Added default
    "integration.subtitle": "For Companies",
    "integration.title": "Native Integration.",
    "integration.description": "Inject your logic directly into the core. Secure. Autonomous. Omnichannel. Don't just connect. Fuse.",
    "integration.button.call": "Book a Briefing",
    "cta.ready.title": "Ready to take your business further?",
    "cta.ready.subtitle": "Let’s build something powerful together.",
    "cta.ready.button": "Contact us today",
    
    // Privacy & Terms (Preserved)
    "privacy.title": "Privacy Policy",
    "privacy.lastUpdated": "Last updated: January 25, 2026",
    "privacy.intro": "At Alpadev (Alejandro Padron, RUT 1047473418), we value your privacy and are committed to protecting your personal data in accordance with Colombian Law 1581 of 2012 (Habeas Data). This Privacy Policy describes how we collect, use, and safeguard your information.",
    "privacy.collect.title": "1. Information We Collect",
    "privacy.collect.intro": "During our business relationship and use of our website, we collect the following information:",
    "privacy.collect.contact.title": "Contact Information",
    "privacy.collect.contact.item1": "Full name",
    "privacy.collect.contact.item2": "Email address",
    "privacy.collect.contact.item3": "Phone number",
    "privacy.collect.contact.item4": "Physical address",
    "privacy.collect.contact.note": "(Including when the Client completes forms on our website or communicates with us by any means).",
    "privacy.collect.professional.title": "Professional Information",
    "privacy.collect.professional.item1": "Company name",
    "privacy.collect.professional.item2": "Job title",
    "privacy.collect.professional.item3": "Industry",
    "privacy.collect.technical.title": "Technical Information",
    "privacy.collect.technical.item1": "IP address",
    "privacy.collect.technical.item2": "Browser type",
    "privacy.collect.technical.item3": "Operating system",
    "privacy.collect.technical.item4": "Website usage data collected via cookies and similar technologies",
    "privacy.collect.technical.note": "(Cookies are used exclusively to improve navigation experience and site functionality).",
    "privacy.collect.financial.title": "Financial and Marketing Information",
    "privacy.collect.financial.item1": "Data provided in the context of financial services, marketing, or AI solutions.",
    "privacy.collect.financial.item2": "Information supplied for marketing campaigns and personalized service delivery.",
    "privacy.usage.title": "2. How We Use Your Information",
    "privacy.usage.intro": "We use collected information for the following purposes:",
    "privacy.usage.service.title": "Service Delivery:",
    "privacy.usage.service.desc": "To manage and execute our BPO services, including financial analysis, marketing strategies, and chatbot solutions.",
    "privacy.usage.communication.title": "Communications:",
    "privacy.usage.communication.desc1": "To respond to your inquiries and requests.",
    "privacy.usage.communication.desc2": "To send you information about our services, proposals, and marketing communications that may interest you.",
    "privacy.usage.technical.title": "Technical Improvements:",
    "privacy.usage.technical.desc": "To analyze how visitors use our website and improve its functionality and user experience.",
    "privacy.usage.legal.title": "Legal Compliance:",
    "privacy.usage.legal.desc": "To comply with applicable legal, regulatory, and tax obligations.",
    "privacy.share.title": "3. Sharing Information with Third Parties",
    "privacy.share.intro": "We may share your information with external service providers who assist in our business operations, including:",
    "privacy.share.item1": "Chatbot and AI providers.",
    "privacy.share.item2": "Digital marketing service providers.",
    "privacy.share.item3": "Web hosting providers.",
    "privacy.share.item4": "Analytics platforms and tech tools.",
    "privacy.share.note": "These third parties will only have access to information necessary to perform their services and are bound by strict confidentiality agreements and compliance with applicable law.",
    "privacy.share.warning": "We will never sell or share your information with third parties for unauthorized commercial purposes.",
    "privacy.transfer.title": "4. International Data Transfer",
    "privacy.transfer.desc": "In some cases, your information may be transferred, stored, and processed outside Colombia by providers or strategic partners of Alpadev, always under adequate protection levels and in compliance with Colombian Law 1581 of 2012 and applicable international privacy standards.",
    "privacy.minors.title": "5. Protection of Minors",
    "privacy.minors.desc": "Our services are not directed to children under 18. We do not knowingly collect personal information from minors. If you are a parent or guardian and believe your minor child has provided us with personal information, please contact us immediately at:",
    "privacy.security.title": "6. Information Security",
    "privacy.security.intro": "Alpadev (Alejandro Padron) implements reasonable technical and administrative measures to protect confidential information against unauthorized access, loss, improper disclosure, and other cyber risks, including:",
    "privacy.security.item1": "Use of secure passwords and user authentication.",
    "privacy.security.item2": "Restricted information access policies.",
    "privacy.security.item3": "Secure deletion of information when no longer needed.",
    "privacy.security.item4": "Constant monitoring to detect vulnerabilities.",
    "privacy.rights.title": "7. Client Rights Over Their Data",
    "privacy.rights.intro": "The Client may at any time request:",
    "privacy.rights.item1": "Access to their personal information.",
    "privacy.rights.item2": "Correction or update of their data.",
    "privacy.rights.item3": "Deletion of their information, except when necessary to retain for legal obligations.",
    "privacy.rights.contact": "Requests can be sent to:",
    "privacy.compliance.title": "8. Compliance with Applicable Law",
    "privacy.compliance.desc": "Alpadev (Alejandro Padron) is committed to complying with Colombian Law 1581 of 2012 (Habeas Data Law) and Decree 1377 of 2013. Users may file complaints with the Superintendencia de Industria y Comercio (SIC) if they believe their data protection rights have been violated.",
    "privacy.update.title": "9. Policy Updates",
    "privacy.update.desc": "Alpadev reserves the right to update this Agreement and its Privacy Policies and Terms of Service at any time. Updates will be published on our website and effective upon publication. The Client is recommended to periodically review these terms.",
    "privacy.contact.title": "Contact",
    "privacy.contact.desc": "For questions, concerns, or requests related to privacy (ARCO rights: Access, Rectification, Cancellation, Opposition), you can contact us at:",
    "terms.title": "Terms and Conditions",
    "terms.lastUpdated": "Last updated: January 25, 2026",
    "terms.intro": "This Agreement sets forth the terms of confidentiality, privacy, and conditions of use between <strong>Alejandro Padron (alpadev)</strong>, RUT 1047473418, domiciled in Colombia, and <strong>the Client</strong>. By using our services and accessing our website, the Client accepts the conditions detailed below.",
    "terms.warranty.title": "1. Disclaimer of Warranties",
    "terms.warranty.intro": "Alpadev does not guarantee that the website will be free of errors, interruptions, or security vulnerabilities. Content and services are provided 'as is' and 'as available', without express or implied warranties. The Provider is not responsible for:",
    "terms.warranty.item1": "Technical failures, interruptions, or data loss.",
    "terms.warranty.item2": "Errors or inaccuracies in published information.",
    "terms.warranty.item3": "Actions of third parties beyond the Company's reasonable control.",
    "terms.liability.title": "2. Limitation of Liability",
    "terms.liability.intro": "The Client accepts that:",
    "terms.liability.item1": "The Company shall not be liable for direct, indirect, incidental, special, or consequential damages arising from website use or information disclosure under legal exceptions.",
    "terms.liability.item2": "The Company guarantees no absolute protection against cyberattacks or unauthorized access beyond its reasonable control.",
    "terms.liability.item3": "The Company shall not be liable for misuse of information by third parties if they breach their contractual obligations.",
    "terms.service.title": "3. Terms of Service",
    "terms.service.acceptable.title": "Acceptable Use",
    "terms.service.acceptable.intro": "By accessing and using the Alpadev website, the Client agrees not to use it for:",
    "terms.service.acceptable.item1": "Illegal or fraudulent activities.",
    "terms.service.acceptable.item2": "Transmitting malicious or harmful content.",
    "terms.service.acceptable.item3": "Infringing intellectual property rights.",
    "terms.service.ip.title": "Intellectual Property",
    "terms.service.ip.desc": "All website content, including text, images, logos, software, and materials, is the exclusive property of Alejandro Padron (alpadev) and protected by Colombian copyright laws. Unauthorized use of this content is strictly prohibited.",
    "terms.service.mod.title": "Modifications",
    "terms.service.mod.desc": "The Company reserves the right to modify, suspend, or discontinue the website or its services at any time without prior notice.",
    "terms.jurisdiction.title": "4. Legislation and Jurisdiction",
    "terms.jurisdiction.desc": "This Agreement shall be governed by the laws of the Republic of Colombia. Any dispute shall be resolved before the competent courts of the city of Cartagena de Indias, Bolívar, Colombia.",
    "terms.contact.title": "5. Contact",
    "terms.contact.desc": "For questions, concerns, or requests related to terms of service, you can contact us at:",
    "terms.agreement.title": "Complete Agreement",
    "terms.agreement.sub": "Acceptance of Terms",
    "terms.agreement.desc": "By using Alpadev services and browsing our website, the Client expressly accepts this Confidentiality Agreement, Privacy Policy, and Terms of Service set forth herein.",
    "scroll.transition.titleA": "Beyond Code",
    "scroll.transition.descA": "We build digital ecosystems that evolve with your business. Robust, secure, and ready for the future.",
    "scroll.transition.titleB": "Measurable Impact",
    "scroll.transition.descB": "From MVP to Enterprise Scale. Precision engineering for real-world results.",
    "scroll.transition.cta": "Start Building",
    
    // Stacked Cards
    "stacked.title": "Why Alpadev?",
    "stacked.subtitle": "Strategic advantages that drive your success.",
    "stacked.card1.title": "Strategic Innovation",
    "stacked.card1.description": "We don’t just write code; we engineer future-proof solutions. By leveraging cutting-edge technologies like AI and Blockchain, we position your business ahead of the curve.",
    "stacked.card2.title": "Scalable Architecture",
    "stacked.card2.description": "Built for growth. Our cloud-native microservices architectures ensure your platform performs flawlessly whether you have 100 or 1,000,000 users.",
    "stacked.card3.title": "Experience Design",
    "stacked.card3.description": "User-centric from the core. We craft intuitive, high-performance interfaces that delight users and drive engagement metrics.",
    "stacked.card4.title": "Continuous Partnership",
    "stacked.card4.description": "We are more than vendors; we are your technical co-founders. Dedicated support, transparent communication, and shared long-term goals.",
    
    // Text Reveal
    "textReveal.content": "To survive is to adapt. To thrive is to lead. We go beyond building software; we architect the trajectory of your business. With unmatched precision and deep intelligence, Alpadev transforms your strategy into reality. We don't just write code. We write the future. Every line brings your vision to life.",
    "scrolly.title": "Lead the Evolution",
    "scrolly.subtitle": "Transforming ideas into digital reality with precision and intelligence.",
  },
  es: {
    // Navbar
    "nav.services": "Servicios",
    "nav.solutions": "Soluciones",
    "nav.plans": "Modelos",
    "nav.testimonials": "Casos de Éxito",
    "nav.contact": "Disponibilidad",
    "nav.home": "Inicio",
    "nav.faq": "FAQ",

    // Hero
    // Hero
    "hero.badge": "Sistemas Críticos. Resueltos.",
    "hero.description": "Diseñamos ecosistemas digitales para empresas que no pueden permitirse tiempos de inactividad. Escala tu visión. Sin deuda técnica.",
    "hero.cta.primary": "Auditar mi Sistema",
    "hero.cta.secondary": "Ver Casos de Éxito",

    // El Enfoque (Features)
    "features.title": "El Enfoque",
    "features.subtitle": "No vendemos horas. Vendemos capacidad operativa.",
    "features.software.title": "Descubrimiento",
    "features.software.description": "La Auditoría. Comenzamos deconstruyendo tu cuello de botella actual. Analizamos código, infraestructura y lógica de negocio para identificar exactamente dónde se pierde la eficiencia.",
    "features.ai.title": "Ejecución",
    "features.ai.description": "La Construcción. Despliegue de equipos de alta velocidad usando Go, Rust y React. Trabajamos en cortes verticales, entregando valor testeable y listo para producción cada sprint. Sin cajas negras.",
    "features.cloud.title": "Transferencia",
    "features.cloud.description": "El Traspaso. No solo enviamos binarios; enviamos capacidad. Documentación exhaustiva, pipelines CI/CD y entrenamiento del equipo aseguran que seas dueño de la máquina que construimos.",
    "features.blockchain.title": "Seguridad",
    "features.blockchain.description": "Zero Trust por defecto. Implementamos encriptación de grado militar, pistas de auditoría y chequeos de cumplimiento automatizados para proteger tus activos más valiosos.",

    // Stats
    "stats.title": "Maestría Técnica Comprobada",
    "stats.subtitle": "Métricas que definen nuestro compromiso con la excelencia en ingeniería.",
    "stats.years": "Años de Experiencia Global",
    "stats.countries": "Países Atendidos",
    "stats.projects": "Despliegues Empresariales",
    "stats.satisfaction": "Tasa de Retención de Clientes",

    // Bento Grid
    "bento.title": "El Tech Stack",
    "bento.subtitle": "Robusto, Type-Safe, Escalable.",
    "bento.mobile.title": "Nativo Multiplataforma",
    "bento.mobile.description": "React Native y Expo para iOS/Android. Módulos nativos, animaciones a 60fps y lógica core compartida.",
    "bento.performance.title": "Alto Rendimiento",
    // Selected Work (StickyShowcase)
    "work.case1.industry": "Fintech / Pagos",
    "work.case1.challenge": "Motor de pagos monolítico causando 40% de latencia en Black Friday.",
    "work.case1.outcome": "99.99% Uptime y finalidad de 200ms a 10k TPS.",

    "work.case2.industry": "SaaS Empresarial / Logística",
    "work.case2.challenge": "Datos de flota desconectados impidiendo decisiones en tiempo real.",
    "work.case2.outcome": "$2M/año ahorrados en combustible vía optimización de rutas con IA.",

    "work.case3.industry": "Fintech / Infraestructura",
    "work.case3.challenge": "Cuellos de botella de cumplimiento retrasando plataforma de trading de alta frecuencia.",
    "work.case3.outcome": "Nube híbrida Zero-Trust desplegada. Aumento del 500% en throughput y aprobación regulatoria.",
    "bento.apis.title": "APIs Type-Safe",
    "bento.apis.description": "Seguridad de tipos end-to-end con tRPC. Comunicación de alto rendimiento vía gRPC y REST.",

    // Testimonials
    "testimonials.title": "Alianzas Globales",
    "testimonials.subtitle": "Empresas líderes en 3 continentes confían en nuestra visión arquitectónica.",
    "testimonial.miguel.location": "Málaga, España",
    "testimonial.miguel.quote": "Alejandro es un talento raro. Su visión arquitectónica para nuestra plataforma internacional fue impecable. No solo escribe código; diseña soluciones que anticipan la escala futura.",
    "testimonial.sofia.location": "Medellín, Colombia",
    "testimonial.sofia.quote": "Un verdadero ingeniero senior. El profesionalismo y la profundidad técnica de Alejandro transformaron nuestro flujo de trabajo. Su código es limpio, documentado e increíblemente robusto.",
    "testimonial.camila.location": "Buenos Aires, Argentina",
    "testimonial.camila.quote": "Necesitábamos una solución fintech compleja y Alpadev cumplió. La visión estratégica combinada con la experiencia práctica en código hizo que nuestro lanzamiento fuera un éxito masivo.",
    "testimonial.cindy.location": "Cartagena, Colombia",
    "testimonial.cindy.quote": "El sistema contable personalizado que construyó Alpadev es la columna vertebral de nuestras operaciones. Ejecución impecable y atención al detalle raramente vista.",
    "testimonial.daniela.location": "Chicago, EE.UU.",
    "testimonial.daniela.quote": "Alejandro es una potencia. Entregó soluciones fullstack de grado empresarial con una velocidad notable. Su proactividad lo hace sentir como un co-fundador.",
    "testimonial.yassine.location": "París, Francia",
    "testimonial.yassine.quote": "Nuestra conversión de e-commerce saltó un 40% gracias a la optimización de Alejandro. Su dominio de los internos de React y el ajuste de rendimiento es de clase mundial.",
    "testimonial.andres.location": "Barcelona, España",
    "testimonial.andres.quote": "Lanzamos nuestra app móvil 3 semanas antes. La maestría de Alejandro en React Native y procesos ágiles es el estándar de oro para la ingeniería remota.",
    "testimonial.edvard.location": "Oslo, Noruega",
    "testimonial.edvard.quote": "Alpadev trajo arquitectura cloud moderna a nuestros sistemas legacy. Seguro, rápido y transparente. El mejor socio técnico que hemos tenido.",
    "testimonial.gabriel.location": "Barranquilla, Colombia",
    "testimonial.gabriel.quote": "Nuestro SaaS no existiría sin Alejandro. Su capacidad para manejar la complejidad fullstack - desde el esquema de la base de datos hasta las animaciones de la UI - es inigualable.",

    // Pricing
    "pricing.program.title": "Modelos de Ingeniería",
    "pricing.program.subtitle": "Colaboración flexible adaptada a tu roadmap técnico.",
    "pricing.title": "Planes flexibles para",
    "pricing.titleHighlight": "el crecimiento técnico",
    "pricing.subtitle": "Escala tu equipo con experiencia senior.",
    
    // Tier 1: Core Fraccional
    "pricing.parttime.title": "Core Fraccional",
    "pricing.parttime.description": "Capacidad de precisión. 20 horas/semana de ingeniería senior enfocada en features de alto impacto.",
    "pricing.parttime.cta": "Iniciar Fraccional",
    "pricing.feature1.pt": "Capacidad Semanal de 20h",
    "pricing.feature2.pt": "Comunicación Síncrona y Asíncrona",
    "pricing.feature3.pt": "Desarrollo de Features",
    "pricing.feature4.pt": "Liderazgo de Code Reviews",
    "pricing.feature5.pt": "Acceso Técnico Directo",
    "pricing.feature6.pt": "Documentación de Arquitectura",
    "pricing.feature7.pt": "Despliegue Cloud (AWS)",

    // Tier 2: Velocidad Total
    "pricing.fulltime.title": "Velocidad Total",
    "pricing.fulltime.description": "Inmersión total. 40 horas/semana. Nos integramos profundamente en tu flujo para enviar código más rápido. Sin fricción.",
    "pricing.fulltime.cta": "Desplegar Equipo",
    "pricing.feature1.ft": "Dedicación Semanal de 40h",
    "pricing.feature2.ft": "Colaboración en Tiempo Real",
    "pricing.feature3.ft": "Propiedad Total de Arquitectura",
    "pricing.feature4.ft": "Respuesta Prioritaria",
    "pricing.feature5.ft": "Lead QA y Mejores Prácticas",
    "pricing.feature6.ft": "CI/CD y Pipeline DevOps",
    "pricing.feature7.ft": "Soluciones Web3 Avanzadas",

    // Tier 3: Asesoría Estratégica
    "pricing.consulting.title": "Asesoría Estratégica",
    "pricing.consulting.description": "Intervención quirúrgica. Resolvemos cuellos de botella arquitectónicos complejos y riesgos de seguridad. On demand.",
    "pricing.consulting.cta": "Agendar Briefing",
    "pricing.feature1.cs": "Auditorías de Arquitectura",
    "pricing.feature2.cs": "Hardening de Seguridad",
    "pricing.feature3.cs": "Mentoría de Equipo",
    "pricing.feature4.cs": "Planes de Migración Legacy",
    "pricing.feature5.cs": "Optimización de Base de Datos",
    "pricing.feature6.cs": "Planificación de Disaster Recovery",
    "pricing.feature7.cs": "Briefing Técnico Ejecutivo",

    "pricing.custom": "¿Necesitas un escuadrón especializado?",
    "pricing.customLink": "Discutamos tu roadmap",
    "pricing.perMonth": "USD / mes",
    "pricing.perYear": "USD / año",
    "pricing.perHour": "USD / hora",

    // FAQ
    "faq.title": "Preguntas",
    "faq.titleHighlight": "Técnicas",
    "faq.subtitle": "Respuestas sobre nuestro stack, metodología y proceso de trabajo.",
    "faq.cta": "Chat en WhatsApp",
    "faq.q1.title": "¿Cuál es su tech stack principal?",
    "faq.q1.content": "Nos especializamos en el ecosistema moderno: React, Next.js, TypeScript, Golang y Python (IA). Para infraestructura usamos AWS/GCP, Docker, Kubernetes y Terraform. Para datos, PostgreSQL, Redis y MongoDB. Elegimos herramientas que garanticen seguridad de tipos y escalabilidad.",
    "faq.q2.title": "¿Cómo manejan los tiempos del proyecto?",
    "faq.q2.content": "Usamos sprints ágiles. Un MVP típico toma 4-8 semanas. Módulos empresariales toman 3-6 meses. Entregamos un roadmap técnico detallado con hitos antes de escribir una sola línea de código.",
    "faq.q3.title": "¿Trabajan con clientes internacionales?",
    "faq.q3.content": "Sí, el 80% de nuestros clientes están en EE.UU. y Europa. Hablamos inglés y español fluido, somos expertos en comunicación asíncrona y nos alineamos con tu zona horaria para reuniones críticas.",
    "faq.q4.title": "¿Qué hay del soporte post-lanzamiento?",
    "faq.q4.content": "Ofrecemos mantenimiento con SLA. Esto cubre parches de seguridad, actualizaciones de dependencias, monitoreo de uptime y soporte de escalado. No solo entregamos y desaparecemos.",
    "faq.q5.title": "¿Cómo garantizan la calidad del código?",
    "faq.q5.content": "Aplicación estricta de linting, type-checking y testing (Unit/E2E). Usamos pipelines de CI/CD para bloquear merges defectuosos. Los code reviews son obligatorios. Escribimos código que otros ingenieros aman leer.",
    "faq.q6.title": "¿Cuáles son los modelos de contratación?",
    "faq.q6.content": "Alcance fijo para proyectos definidos, Retainer para roles de CTO/Dev fraccional, o Tiempo y Materiales para auditorías. Somos flexibles a tu burn rate y necesidades.",
    "faq.q7.title": "¿Pueden construir agentes de IA?",
    "faq.q7.content": "Sí. Implementamos agentes autónomos basados en LLM usando LangChain, APIs de OpenAI/Anthropic y bases de datos vectoriales. Construimos sistemas que pueden 'pensar', razonar y ejecutar tareas, no solo chatbots.",
    "faq.q8.title": "¿Hacen Smart Contracts?",
    "faq.q8.content": "Sí. Desarrollamos y auditamos smart contracts en Solidity para Ethereum y L2s. Manejamos estándares de tokens (ERC20/721), conexiones de billetera (Wagmi/Viem) y patrones seguros de interacción de contratos.",

    // Call to Action
    "cta.title": "Disponibilidad Limitada.",
    "cta.subtitle": "Actualmente aceptamos 2 nuevas alianzas por trimestre para mantener nuestro estándar de participación. Por favor detalla tu roadmap técnico abajo.",
    "cta.button": "Solicitar Consultoría",
    "cta2.title": "Inicializa tu Transformación",
    "cta2.subtitle": "Completa el formulario de admisión. Analizaremos tus requerimientos y propondremos una arquitectura de alto nivel en 24 horas.",
    "cta2.primary": "Empezar Ahora",
    "cta2.secondary": "Ver Portafolio",

    // Footer
    "footer.solutions": "Servicios",
    "footer.legal": "Legal",
    "footer.terms": "Términos",
    "footer.privacy": "Privacidad",
    "footer.rights": "Todos los derechos reservados.",
    "footer.madeBy": "Ingeniería por Alpadev",

    // Section
    "section.subtitle": "Construye rápido, escala sin límites, piensa en grande.",
    "section.title": "Ingeniería de Ingresos.",
    "section.description": "Diseñamos y desplegamos ecosistemas de software a medida para empresas que no pueden permitirse tiempos de inactividad.",
    "section.feature1.title": "Consistencia y transformación",
    "section.feature1.description": "Nos integramos con tu equipo para construir una base de estabilidad e innovación. Con marcos probados y metodologías ágiles, impulsamos tu crecimiento tecnológico y estratégico: sólido, escalable y listo para los próximos desafíos.",
    "section.feature2.title": "Objetivos compartidos",
    "section.feature2.description": "Desde el día uno, tus metas son las nuestras. Con colaboración cercana, comunicación transparente y KPIs claros, desbloqueamos eficiencias operativas y aumentamos la rentabilidad: cada proyecto se convierte en un resultado medible.",
    "section.feature3.title": "B2B y B2C",
    "section.feature3.description": "Ya sea que vendas a empresas o consumidores, diseñamos estrategias omnicanal que capturan nuevos mercados. Desde generación de demanda hasta fidelización, nuestras soluciones a medida impulsan un crecimiento equilibrado.",
    
    // Forms
    "form.title": "Envíanos tu solicitud",
    "form.subtitle": "Completa el formulario y nos pondremos en contacto contigo pronto",
    "form.name": "Nombre completo",
    "form.namePlaceholder": "Ingresa tu nombre completo",
    "form.email": "Email",
    "form.emailPlaceholder": "tu@email.com",
    "form.phone": "Teléfono",
    "form.phonePlaceholder": "+1 234 567 8900",
    "form.message": "Mensaje",
    "form.messagePlaceholder": "Describe tu consulta",
    "form.submit": "Enviar Solicitud",
    "form.submitting": "Enviando...",
    "form.subject": "Asunto",
    "form.subjectPlaceholder": "Breve descripción del asunto",
    "form.description": "Descripción",
    "form.descriptionPlaceholder": "Describe tu solicitud con el mayor detalle posible",
    "form.type": "Tipo de solicitud",
    "form.typePlaceholder": "Selecciona el tipo",
    "form.priority": "Prioridad",
    "form.priorityPlaceholder": "Selecciona la prioridad",
    "form.typeTicket": "Ticket de Soporte",
    "form.typeTicketDesc": "Reportar un problema o solicitar ayuda",
    "form.typeQuote": "Solicitar Cotización",
    "form.typeQuoteDesc": "Obtener información sobre precios y servicios",
    "form.typeOther": "Otro",
    "form.typeOtherDesc": "Otra consulta o solicitud",
    "form.priorityLow": "Baja",
    "form.priorityLowDesc": "No es urgente",
    "form.priorityMedium": "Media",
    "form.priorityMediumDesc": "Prioridad normal",
    "form.priorityHigh": "Alta",
    "form.priorityHighDesc": "Requiere atención pronta",
    "form.priorityCritical": "Crítica",
    "form.priorityCriticalDesc": "Urgente - requiere atención inmediata",
    "form.errorNameShort": "El nombre debe tener al menos 2 caracteres",
    "form.errorEmailInvalid": "Email inválido",
    "form.errorPhoneShort": "El teléfono debe tener al menos 8 caracteres",
    "form.errorSubjectShort": "El asunto debe tener al menos 5 caracteres",
    "form.errorDescriptionShort": "La descripción debe tener al menos 10 caracteres",

    // Newsletter
    "newsletter.title": "Suscríbete a nuestro newsletter",
    "newsletter.description": "Mantente actualizado con las últimas noticias, conocimientos y contenido exclusivo de nuestro equipo. Sin spam, solo contenido valioso entregado a tu bandeja de entrada.",
    "newsletter.emailLabel": "Dirección de email",
    "newsletter.emailPlaceholder": "Ingresa tu email",
    "newsletter.subscribe": "Suscribirse",
    "newsletter.feature1.title": "Artículos semanales",
    "newsletter.feature1.description": "Obtén las últimas perspectivas y tendencias de la industria entregadas directamente a tu bandeja de entrada cada semana.",
    "newsletter.feature2.title": "Sin spam",
    "newsletter.feature2.description": "Respetamos tu privacidad y nunca compartiremos tu email ni enviaremos mensajes no deseados.",

    // Preserved Keys
    "vision.restructure.title": "Visión y Reestructuración",
    "vision.restructure.description": "No solo vendemos servicios, reestructuramos empresas. Alineamos tecnología, estrategia creativa y operaciones de ventas para crear un motor unificado de crecimiento.",
    "vision.restructure.tech": "Tecnología",
    "vision.restructure.creative": "Estrategia Creativa",
    "vision.restructure.sales": "Operaciones de Ventas",
    "faq.cta": "Contáctanos por WhatsApp",
    "footer.madeBy": "Desarrollado por: Alpadev.xyz",
    "trustedBy.title": "Empresas innovadoras confían en nosotros", // Added default
    "integration.subtitle": "Para Desarrolladores",
    "integration.title": "Intégrate con Alpadev",
    "integration.description": "Integra sin problemas tu lógica de negocio en nuestro ecosistema para permitir una ejecución segura, autónoma y poderosa en todos los canales.",
    "integration.button.call": "Agendar Llamada",
    "integration.button.build": "Empezar a Construir",
    "integration.orbit.main": "Ecosistema",
    "integration.orbit.revenue": "Ingresos",
    "integration.orbit.finance": "Finanzas",
    "integration.orbit.marketing": "Marketing",
    "integration.orbit.ai": "IA",
    "integration.orbit.blockchain": "Blockchain",
    "integration.orbit.service": "Servicios",
    "cta.ready.title": "¿Listo para llevar tu negocio al siguiente nivel?",
    "cta.ready.subtitle": "Construyamos algo poderoso juntos.",
    "cta.ready.button": "Contáctanos hoy",
    
    // Privacy & Terms (Preserved, translated)
    "privacy.title": "Política de Privacidad",
    "privacy.lastUpdated": "Última actualización: 25 de Enero, 2026",
    "privacy.intro": "En Alpadev (Alejandro Padron, RUT 1047473418), valoramos su privacidad y nos comprometemos a proteger sus datos personales de acuerdo con la Ley 1581 de 2012 (Habeas Data) de Colombia. Esta Política de Privacidad describe cómo recopilamos, utilizamos y salvaguardamos su información.",
    "scroll.transition.titleA": "Más allá del código",
    "scroll.transition.descA": "Construimos ecosistemas digitales que evolucionan con tu negocio. Robustos, seguros y listos para el futuro.",
    "scroll.transition.titleB": "Impacto Medible",
    "scroll.transition.descB": "Desde MVP hasta escala empresarial. Ingeniería de precisión para resultados reales.",
    "scroll.transition.cta": "Empieza a Construir",

    // Stacked Cards
    "stacked.title": "¿Por qué Alpadev?",
    "stacked.subtitle": "Ventajas estratégicas que impulsan tu éxito.",
    "stacked.card1.title": "Innovación Estratégica",
    "stacked.card1.description": "No solo escribimos código; diseñamos soluciones a prueba de futuro. Aprovechamos tecnologías de vanguardia como IA y Blockchain para posicionar tu negocio por delante de la competencia.",
    "stacked.card2.title": "Arquitectura Escalable",
    "stacked.card2.description": "Construido para crecer. Nuestras arquitecturas de microservicios cloud-native aseguran que tu plataforma funcione impecablemente tanto con 100 como con 1,000,000 de usuarios.",
    "stacked.card3.title": "Diseño de Experiencia",
    "stacked.card3.description": "Centrado en el usuario desde el núcleo. Creamos interfaces intuitivas y de alto rendimiento que encantan a los usuarios y mejoran las métricas de retención.",
    "stacked.card4.title": "Alianza Continua",
    "stacked.card4.description": "Somos más que proveedores; somos tus co-fundadores técnicos. Soporte dedicado, comunicación transparente y objetivos compartidos a largo plazo.",

    "stacked.card4.title": "Alianza Continua",
    "stacked.card4.description": "Somos más que proveedores; somos tus co-fundadores técnicos. Soporte dedicado, comunicación transparente y objetivos compartidos a largo plazo.",

    // Text Reveal
    "textReveal.content": "En un mundo impulsado por el cambio constante, adaptarse no es suficiente. Debes liderar la evolución. En Alpadev, no solo construimos software; arquitectamos el futuro de tu negocio con precisión, inteligencia y un compromiso inquebrantable con la excelencia. Cada línea de código es un paso hacia tu visión.",
    "scrolly.title": "Lidera la Evolución",
    "scrolly.subtitle": "Transformando ideas en realidad digital con precisión e inteligencia.",

    "privacy.collect.title": "1. Información que Recopilamos",
    "privacy.collect.intro": "Durante la relación comercial y el uso de nuestro sitio web, recopilamos la siguiente información:",
    "privacy.collect.contact.title": "Información de Contacto",
    "privacy.collect.contact.item1": "Nombre completo",
    "privacy.collect.contact.item2": "Dirección de correo electrónico",
    "privacy.collect.contact.item3": "Número de teléfono",
    "privacy.collect.contact.item4": "Dirección física",
    "privacy.collect.contact.note": "(Incluyendo cuando El Cliente completa formularios en nuestro sitio web o se comunica con nosotros por cualquier medio).",
    "privacy.collect.professional.title": "Información Profesional",
    "privacy.collect.professional.item1": "Nombre de la empresa",
    "privacy.collect.professional.item2": "Cargo",
    "privacy.collect.professional.item3": "Industria en la que opera",
    "privacy.collect.technical.title": "Información Técnica",
    "privacy.collect.technical.item1": "Dirección IP",
    "privacy.collect.technical.item2": "Tipo de navegador",
    "privacy.collect.technical.item3": "Sistema operativo",
    "privacy.collect.technical.item4": "Datos de uso del sitio web recopilados mediante cookies y tecnologías similares",
    "privacy.collect.technical.note": "(El uso de cookies es exclusivamente para mejorar la experiencia de navegación y funcionalidad del sitio).",
    "privacy.collect.financial.title": "Información Financiera y de Marketing",
    "privacy.collect.financial.item1": "Datos proporcionados en el contexto de servicios financieros, marketing o soluciones de inteligencia artificial.",
    "privacy.collect.financial.item2": "Información suministrada para campañas de marketing y prestación de servicios personalizados.",
    "privacy.usage.title": "2. Cómo Utilizamos su Información",
    "privacy.usage.intro": "Utilizamos la información recopilada para los siguientes fines:",
    "privacy.usage.service.title": "Prestación de Servicios:",
    "privacy.usage.service.desc": "Para gestionar y ejecutar nuestros servicios de BPO, incluyendo análisis financiero, estrategias de marketing y soluciones de chatbot.",
    "privacy.usage.communication.title": "Comunicaciones:",
    "privacy.usage.communication.desc1": "Para responder a sus consultas y solicitudes.",
    "privacy.usage.communication.desc2": "Para enviarle información sobre nuestros servicios, propuestas y comunicaciones de marketing que puedan ser de su interés.",
    "privacy.usage.technical.title": "Mejoras Técnicas:",
    "privacy.usage.technical.desc": "Para analizar cómo los visitantes utilizan nuestro sitio web y mejorar su funcionalidad y experiencia de usuario.",
    "privacy.usage.legal.title": "Cumplimiento Legal:",
    "privacy.usage.legal.desc": "Para cumplir con las obligaciones legales, reglamentarias y fiscales aplicables.",
    "privacy.share.title": "3. Compartición de Información con Terceros",
    "privacy.share.intro": "Podemos compartir su información con proveedores de servicios externos que colaboran en la operación de nuestro negocio, incluyendo:",
    "privacy.share.item1": "Proveedores de chatbot e inteligencia artificial.",
    "privacy.share.item2": "Proveedores de servicios de marketing digital.",
    "privacy.share.item3": "Proveedores de alojamiento web (hosting).",
    "privacy.share.item4": "Plataformas de análisis y herramientas tecnológicas.",
    "privacy.share.note": "Estos terceros solo tendrán acceso a la información necesaria para la prestación de sus servicios y estarán obligados por estrictos acuerdos de confidencialidad y cumplimiento de la legislación aplicable.",
    "privacy.share.warning": "Nunca venderemos ni compartiremos su información con terceros para fines comerciales no autorizados.",
    "privacy.transfer.title": "4. Transferencia Internacional de Datos",
    "privacy.transfer.desc": "En algunos casos, su información puede ser transferida, almacenada y procesada fuera de Colombia por proveedores o aliados estratégicos de Alpadev, siempre bajo niveles adecuados de protección y en cumplimiento de la Ley 1581 de 2012 y estándares internacionales de privacidad.",
    "privacy.minors.title": "5. Protección de Menores",
    "privacy.minors.desc": "Nuestros servicios no están dirigidos a niños menores de 18 años. No recopilamos deliberadamente información personal de menores. Si usted es padre o tutor y cree que su hijo menor nos ha proporcionado información personal, por favor contáctenos de inmediato al correo:",
    "privacy.security.title": "6. Seguridad de la Información",
    "privacy.security.intro": "Alpadev (Alejandro Padron) implementa medidas técnicas y administrativas razonables para proteger la información confidencial contra accesos no autorizados, pérdidas, divulgaciones indebidas y otros riesgos cibernéticos, incluyendo:",
    "privacy.security.item1": "Uso de contraseñas seguras y autenticación de usuarios.",
    "privacy.security.item2": "Políticas de acceso restringido a la información.",
    "privacy.security.item3": "Eliminación segura de la información cuando ya no sea necesaria.",
    "privacy.security.item4": "Monitoreo constante para detectar vulnerabilidades.",
    "privacy.rights.title": "7. Derechos del Cliente sobre sus Datos",
    "privacy.rights.intro": "El Cliente podrá en cualquier momento solicitar:",
    "privacy.rights.item1": "Acceso a su información personal.",
    "privacy.rights.item2": "Corrección o actualización de sus datos.",
    "privacy.rights.item3": "Eliminación de su información, salvo cuando sea necesario conservarla para cumplir obligaciones legales.",
    "privacy.rights.contact": "Las solicitudes pueden enviarse a:",
    "privacy.compliance.title": "8. Cumplimiento de Legislación Aplicable",
    "privacy.compliance.desc": "Alpadev (Alejandro Padron) se compromete a cumplir con la Ley 1581 de 2012 (Ley de Habeas Data) y el Decreto 1377 de 2013 de Colombia. Los usuarios pueden presentar quejas ante la Superintendencia de Industria y Comercio (SIC) si consideran que sus derechos de protección de datos han sido vulnerados.",
    "privacy.update.title": "9. Actualización de la Política",
    "privacy.update.desc": "Alpadev se reserva el derecho de actualizar este Acuerdo y sus Políticas de Privacidad y Términos de Servicio en cualquier momento. Las actualizaciones serán publicadas en nuestro sitio web y entrarán en vigor desde su publicación. Se recomienda al Cliente revisar periódicamente estos términos.",
    "privacy.contact.title": "Contacto",
    "privacy.contact.desc": "Para preguntas, inquietudes o solicitudes relacionadas con la privacidad, puede contactarnos al correo:",
    "terms.title": "Términos y Condiciones",
    "terms.lastUpdated": "Última actualización: 25 de Enero, 2026",
    "terms.intro": "Este Acuerdo establece los términos de confidencialidad, privacidad y condiciones de uso entre <strong>Alejandro Padron (alpadev)</strong>, RUT 1047473418, con domicilio en Cartagena de Indias, Colombia, y <strong>el Cliente</strong>. Al utilizar nuestros servicios y acceder a nuestro sitio web, el Cliente acepta las condiciones que se detallan a continuación.",
    "terms.warranty.title": "1. Exclusión de Garantías",
    "terms.warranty.intro": "Alpadev no garantiza que el sitio web esté libre de errores, interrupciones o vulnerabilidades de seguridad. El contenido y los servicios se proporcionan “tal cual” y “según disponibilidad”, sin garantías expresas o implícitas. La Empresa no se hace responsable por:",
    "terms.warranty.item1": "Fallos técnicos, interrupciones o pérdidas de datos.",
    "terms.warranty.item2": "Errores o inexactitudes en la información publicada.",
    "terms.warranty.item3": "Acciones de terceros fuera del control razonable de La Empresa.",
    "terms.liability.title": "2. Limitación de Responsabilidad",
    "terms.liability.intro": "El Cliente acepta que:",
    "terms.liability.item1": "La Empresa no será responsable por daños directos, indirectos, incidentales, especiales o consecuenciales derivados del uso del sitio web o de la divulgación de información bajo las excepciones legales.",
    "terms.liability.item2": "La Empresa no garantiza protección absoluta contra ciberataques o accesos no autorizados que escapen a su control razonable.",
    "terms.liability.item3": "La Empresa no será responsable por el uso indebido de la información por parte de terceros si estos incumplen sus obligaciones contractuales.",
    "terms.service.title": "3. Términos de Servicio",
    "terms.service.acceptable.title": "Uso Aceptable",
    "terms.service.acceptable.intro": "Al acceder y utilizar el sitio web de Alpadev, El Cliente acepta no utilizarlo para:",
    "terms.service.acceptable.item1": "Actividades ilegales o fraudulentas.",
    "terms.service.acceptable.item2": "Transmitir contenido malicioso o dañino.",
    "terms.service.acceptable.item3": "Infringir derechos de propiedad intelectual.",
    "terms.service.ip.title": "Propiedad Intelectual",
    "terms.service.ip.desc": "Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos, software y materiales, es propiedad exclusiva de Alejandro Padron (alpadev) y está protegido por las leyes de derechos de autor de Colombia. El uso no autorizado de estos contenidos está estrictamente prohibido.",
    "terms.service.mod.title": "Modificaciones",
    "terms.service.mod.desc": "La Empresa se reserva el derecho de modificar, suspender o discontinuar el sitio web o sus servicios en cualquier momento sin previo aviso.",
    "terms.jurisdiction.title": "4. Legislación y Jurisdicción",
    "terms.jurisdiction.desc": "Este Acuerdo se regirá por las leyes de la República de Colombia. Cualquier disputa será resuelta ante los tribunales competentes de la ciudad de Cartagena de Indias, Bolívar, Colombia.",
    "terms.contact.title": "5. Contacto",
    "terms.contact.desc": "Para preguntas, inquietudes o solicitudes relacionadas con los términos de servicio, puede contactarnos al correo:",
    "terms.agreement.title": "Acuerdo Completo",
    "terms.agreement.sub": "Aceptación de los Términos",
    "terms.agreement.desc": "Al utilizar los servicios de Alpadev y navegar en nuestro sitio web, El Cliente acepta expresamente este Acuerdo de Confidencialidad, la Política de Privacidad y los Términos de Servicio aquí establecidos.",

  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
      setLanguageState(savedLanguage)
    }
    setIsLoaded(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    // Force re-render by triggering a state change
    setTimeout(() => {
      window.dispatchEvent(new Event('languagechange'))
    }, 0)
  }

  const t = (key: string): string => {
    const translation = translations[language]?.[key as keyof typeof translations.en]
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`)
      return key
    }
    return translation
  }

  // Don't render until language is loaded from localStorage
  if (!isLoaded) {
    return null
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

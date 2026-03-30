import { TRPCError } from "@trpc/server";
import Papa from "papaparse";
import type { PrismaClient } from "@package/db";
import { WebStatus } from "@package/db";
import {
  createProspectSchema,
  type ProspectFilterInput,
  type ImportProspectsInput,
  type ExportProspectsInput,
} from "@package/validations";
import { ProspectRepository } from "../repository/prospect.repository";

const HEADER_MAP: Record<string, string> = {
  // English JSON fields → Prisma model fields
  name: "nombre",
  display_name: "displayName",
  niche: "nicho",
  industry: "industry",
  city: "ciudad",
  state: "estado",
  country: "pais",
  country_flag: "countryFlag",
  address: "direccion",
  website: "sitioWeb",
  email: "email",
  facebook: "facebook",
  instagram: "instagram",
  tiktok: "tiktok",
  phone: "telefono",
  description: "description",
  scoring: "score",
  web_status: "webStatus",
  services_fit: "serviciosRecomendados",
  active_services: "serviciosActivos",
  opportunity: "opportunity",
  tags: "tags",
  verified: "verified",
  verified_at: "verifiedAt",
  verification_notes: "verificationNotes",
  source: "source",
  // Spanish CSV headers
  Nombre: "nombre",
  Nicho: "nicho",
  Ciudad: "ciudad",
  Estado: "estado",
  Pais: "pais",
  Direccion: "direccion",
  "Sitio Web": "sitioWeb",
  Email: "email",
  Facebook: "facebook",
  Instagram: "instagram",
  TikTok: "tiktok",
  Telefono: "telefono",
  Score: "score",
  "Web Status": "webStatus",
};

const REVERSE_HEADER_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(HEADER_MAP).map(([k, v]) => [v, k]),
);

// Fields to skip during flat mapping (handled separately)
const NESTED_FIELDS = new Set([
  "recommendations",
  "location",
  "social",
  "id",
  "created_at",
  "updated_at",
]);

const OPTIONAL_STRING_FIELDS = new Set([
  "sitioWeb",
  "email",
  "facebook",
  "instagram",
  "tiktok",
  "telefono",
  "displayName",
  "countryFlag",
  "description",
  "verificationNotes",
  "source",
]);

const ALL_ARRAY_FIELDS = new Set([
  "serviciosRecomendados",
  "serviciosActivos",
  "opportunity",
  "tags",
  "industry",
  "recSoftware",
  "recMarketing",
  "recFinanzas",
]);

export class ProspectService {
  private repository: ProspectRepository;
  private db: PrismaClient;

  constructor(db: PrismaClient) {
    this.db = db;
    this.repository = new ProspectRepository(db);
  }

  async getAll(filter: ProspectFilterInput, userId: string) {
    return this.repository.findMany({ ...filter, userId });
  }

  async getById(id: string, userId: string) {
    const prospect = await this.repository.findById(id);
    if (!prospect) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Prospect not found" });
    }
    if (prospect.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return prospect;
  }

  async create(
    data: Parameters<ProspectRepository["create"]>[0] extends infer T
      ? Omit<T, "userId">
      : never,
    userId: string,
  ) {
    return this.repository.create({
      ...data,
      userId,
    } as Parameters<ProspectRepository["create"]>[0]);
  }

  async update(id: string, data: Parameters<ProspectRepository["update"]>[1], userId: string) {
    const prospect = await this.repository.findById(id);
    if (!prospect) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Prospect not found" });
    }
    if (prospect.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return this.repository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const prospect = await this.repository.findById(id);
    if (!prospect) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Prospect not found" });
    }
    if (prospect.userId !== userId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
    }
    return this.repository.delete(id);
  }

  async importProspects(input: ImportProspectsInput, userId: string) {
    let rows: Record<string, unknown>[];

    if (input.format === "csv") {
      const parsed = Papa.parse<Record<string, string>>(input.data, {
        header: true,
        skipEmptyLines: true,
      });
      rows = parsed.data;
    } else {
      rows = JSON.parse(input.data) as Record<string, unknown>[];
    }

    const errors: { row: number; field?: string; message: string }[] = [];
    const validRows: Parameters<ProspectRepository["create"]>[0][] = [];
    const VALID_WEB_STATUSES = new Set(Object.values(WebStatus));

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      if (!raw) continue;

      const mapped: Record<string, unknown> = {};

      // Flatten nested "recommendations" object
      const recommendations = raw.recommendations as
        | { software?: string[]; marketing?: string[]; finance?: string[] }
        | undefined;
      if (recommendations && typeof recommendations === "object") {
        mapped.recSoftware = Array.isArray(recommendations.software)
          ? recommendations.software
          : [];
        mapped.recMarketing = Array.isArray(recommendations.marketing)
          ? recommendations.marketing
          : [];
        mapped.recFinanzas = Array.isArray(recommendations.finance)
          ? recommendations.finance
          : [];
      }

      // Map flat fields via HEADER_MAP
      for (const [key, value] of Object.entries(raw)) {
        if (NESTED_FIELDS.has(key)) continue;
        const field = HEADER_MAP[key] ?? key;
        mapped[field] = value;
      }

      // Transform score
      if (typeof mapped.score === "string") {
        mapped.score = parseInt(mapped.score, 10) || 0;
      } else if (typeof mapped.score === "number") {
        mapped.score = Math.min(10, Math.max(0, Math.round(mapped.score)));
      }

      // Transform webStatus
      if (typeof mapped.webStatus === "string") {
        mapped.webStatus = VALID_WEB_STATUSES.has(mapped.webStatus as WebStatus)
          ? mapped.webStatus
          : "none";
      }

      // Transform verified
      if (typeof mapped.verified !== "boolean") {
        mapped.verified = mapped.verified === "true" || mapped.verified === true;
      }

      // Transform verifiedAt to ISO string or null
      if (mapped.verifiedAt && typeof mapped.verifiedAt === "string") {
        // keep as ISO string
      } else {
        mapped.verifiedAt = null;
      }

      // Handle all array fields — keep arrays as-is, split strings
      for (const arrayField of ALL_ARRAY_FIELDS) {
        if (Array.isArray(mapped[arrayField])) {
          // already an array
        } else if (typeof mapped[arrayField] === "string") {
          const val = (mapped[arrayField] as string).trim();
          const sep = arrayField.startsWith("rec") ? "|" : ";";
          mapped[arrayField] = val ? val.split(sep).map((s) => s.trim()) : [];
        } else {
          mapped[arrayField] = mapped[arrayField] ?? [];
        }
      }

      // Trim strings and convert empty/null to null for optional fields
      for (const [key, value] of Object.entries(mapped)) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          mapped[key] =
            OPTIONAL_STRING_FIELDS.has(key) && trimmed === ""
              ? null
              : trimmed;
        }
      }

      const result = createProspectSchema.safeParse(mapped);

      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            row: i + 1,
            field: issue.path.join("."),
            message: issue.message,
          });
        }
      } else {
        validRows.push({ ...result.data, userId });
      }
    }

    // Deduplicate: fetch existing prospect names for this user
    const existing = await this.db.prospect.findMany({
      where: { userId },
      select: { nombre: true },
    });
    const existingNames = new Set(
      existing.map((p) => p.nombre.toLowerCase().trim()),
    );

    const newRows = validRows.filter(
      (row) => !existingNames.has(row.nombre.toLowerCase().trim()),
    );
    const skipped = validRows.length - newRows.length;

    // Insert in batches of 500 to avoid OOM, wrapped in a transaction
    const BATCH_SIZE = 500;
    await this.db.$transaction(async (tx) => {
      for (let i = 0; i < newRows.length; i += BATCH_SIZE) {
        const batch = newRows.slice(i, i + BATCH_SIZE);
        await tx.prospect.createMany({ data: batch });
      }
    });

    return {
      imported: newRows.length,
      total: rows.length,
      skipped,
      errors,
    };
  }

  async exportProspects(input: ExportProspectsInput, userId: string) {
    const { format, ...filters } = input;
    const prospects = await this.repository.findAll(filters, userId);

    const exportRows = prospects.map((prospect) => {
      const row: Record<string, string> = {};

      for (const [field, header] of Object.entries(REVERSE_HEADER_MAP)) {
        const value = (prospect as Record<string, unknown>)[field];

        if (Array.isArray(value)) {
          const separator = field.startsWith("rec") ? "|" : ";";
          row[header] = value.join(separator);
        } else if (value === null || value === undefined) {
          row[header] = "";
        } else {
          row[header] = String(value);
        }
      }

      return row;
    });

    const data =
      format === "csv"
        ? Papa.unparse(exportRows)
        : JSON.stringify(exportRows, null, 2);

    return {
      data,
      count: prospects.length,
      format,
    };
  }
}

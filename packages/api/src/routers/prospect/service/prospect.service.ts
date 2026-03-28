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
  "Servicios Recomendados": "serviciosRecomendados",
  "Servicios Activos": "serviciosActivos",
  "Rec. Software": "recSoftware",
  "Rec. Marketing": "recMarketing",
  "Rec. Finanzas": "recFinanzas",
};

const REVERSE_HEADER_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(HEADER_MAP).map(([k, v]) => [v, k]),
);

export class ProspectService {
  private repository: ProspectRepository;

  constructor(db: PrismaClient) {
    this.repository = new ProspectRepository(db);
  }

  async getAll(filter: ProspectFilterInput, userId: string) {
    return this.repository.findMany({ ...filter, userId });
  }

  async getById(id: string) {
    const prospect = await this.repository.findById(id);
    if (!prospect) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Prospect not found" });
    }
    return prospect;
  }

  async create(data: Parameters<ProspectRepository["create"]>[0] extends infer T ? Omit<T, "userId"> : never, userId: string) {
    return this.repository.create({ ...data, userId } as Parameters<ProspectRepository["create"]>[0]);
  }

  async update(id: string, data: Parameters<ProspectRepository["update"]>[1]) {
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    return this.repository.delete(id);
  }

  async importProspects(input: ImportProspectsInput, userId: string) {
    let rows: Record<string, string>[];

    if (input.format === "csv") {
      const parsed = Papa.parse<Record<string, string>>(input.data, {
        header: true,
        skipEmptyLines: true,
      });
      rows = parsed.data;
    } else {
      rows = JSON.parse(input.data) as Record<string, string>[];
    }

    const errors: { row: number; field?: string; message: string }[] = [];
    const validRows: Parameters<ProspectRepository["create"]>[0][] = [];

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      if (!raw) continue;

      const mapped: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(raw)) {
        const field = HEADER_MAP[key] ?? key;
        mapped[field] = value;
      }

      // Transform fields
      if (typeof mapped.score === "string") {
        mapped.score = parseInt(mapped.score, 10) || 0;
      }

      if (typeof mapped.webStatus === "string") {
        const wsValue = mapped.webStatus as string;
        mapped.webStatus =
          Object.values(WebStatus).includes(wsValue as WebStatus)
            ? wsValue
            : "none";
      }

      // Split array fields by ";"
      for (const arrayField of ["serviciosRecomendados", "serviciosActivos"]) {
        if (typeof mapped[arrayField] === "string") {
          const val = (mapped[arrayField] as string).trim();
          mapped[arrayField] = val ? val.split(";").map((s) => s.trim()) : [];
        }
      }

      // Split rec arrays by "|"
      for (const recField of ["recSoftware", "recMarketing", "recFinanzas"]) {
        if (typeof mapped[recField] === "string") {
          const val = (mapped[recField] as string).trim();
          mapped[recField] = val ? val.split("|").map((s) => s.trim()) : [];
        }
      }

      // Trim strings and convert empty strings to null for optional fields
      const optionalFields = [
        "sitioWeb",
        "email",
        "facebook",
        "instagram",
        "tiktok",
        "telefono",
      ];
      for (const [key, value] of Object.entries(mapped)) {
        if (typeof value === "string") {
          const trimmed = value.trim();
          mapped[key] = optionalFields.includes(key) && trimmed === "" ? null : trimmed;
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

    if (validRows.length > 0) {
      await this.repository.createMany(validRows);
    }

    return {
      imported: validRows.length,
      total: rows.length,
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
          // servicios arrays use ";", rec arrays use "|"
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

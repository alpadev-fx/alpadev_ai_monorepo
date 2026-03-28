import { type PrismaClient, type Prisma } from "@package/db";
import type { ProspectFilterInput } from "@package/validations";

export class ProspectRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: string) {
    return this.db.prospect.findUnique({ where: { id } });
  }

  async findMany(filter: ProspectFilterInput & { userId: string }) {
    const where = this.buildWhereClause(filter, filter.userId);
    const skip = (filter.page - 1) * filter.pageSize;

    const [items, total] = await Promise.all([
      this.db.prospect.findMany({
        where,
        skip,
        take: filter.pageSize,
        orderBy: { [filter.sortBy]: filter.sortOrder },
      }),
      this.db.prospect.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page: filter.page,
        pageSize: filter.pageSize,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    };
  }

  async findAll(
    filter: Omit<ProspectFilterInput, "page" | "pageSize" | "sortBy" | "sortOrder">,
    userId: string,
  ) {
    const where = this.buildWhereClause(filter, userId);
    return this.db.prospect.findMany({ where });
  }

  async create(data: Prisma.ProspectUncheckedCreateInput) {
    return this.db.prospect.create({ data });
  }

  async createMany(data: Prisma.ProspectUncheckedCreateInput[]) {
    return this.db.prospect.createMany({ data });
  }

  async update(id: string, data: Prisma.ProspectUncheckedUpdateInput) {
    return this.db.prospect.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.prospect.delete({ where: { id } });
  }

  private buildWhereClause(
    filter: Partial<ProspectFilterInput>,
    userId: string,
  ): Prisma.ProspectWhereInput {
    const where: Prisma.ProspectWhereInput = { userId };

    if (filter.search) {
      where.OR = [
        { nombre: { contains: filter.search, mode: "insensitive" } },
        { nicho: { contains: filter.search, mode: "insensitive" } },
        { ciudad: { contains: filter.search, mode: "insensitive" } },
        { email: { contains: filter.search, mode: "insensitive" } },
        { telefono: { contains: filter.search, mode: "insensitive" } },
      ];
    }

    if (filter.nicho && filter.nicho.length > 0) {
      where.nicho = { in: filter.nicho };
    }

    if (filter.webStatus && filter.webStatus.length > 0) {
      where.webStatus = { in: filter.webStatus };
    }

    if (filter.scoreMin !== undefined || filter.scoreMax !== undefined) {
      where.score = {
        ...(filter.scoreMin !== undefined && { gte: filter.scoreMin }),
        ...(filter.scoreMax !== undefined && { lte: filter.scoreMax }),
      };
    }

    if (filter.ciudad) {
      where.ciudad = { contains: filter.ciudad, mode: "insensitive" };
    }

    if (filter.estado) {
      where.estado = { contains: filter.estado, mode: "insensitive" };
    }

    if (filter.pais) {
      where.pais = { contains: filter.pais, mode: "insensitive" };
    }

    return where;
  }
}

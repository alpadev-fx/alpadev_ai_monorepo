type Row = Record<string, any>;
const arrays = ['expenses', 'subscriptions', 'apiFunds', 'domains', 'providerBudgets', 'softwareModules', 'components', 'orders', 'events', 'checklist', 'risks', 'decisions', 'connections', 'tests', 'issues', 'comparisons'];
const record = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const amount = (v: unknown) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0);
const optionalAmount = (v: unknown) => v === undefined || amount(v);
const quantity = (v: unknown) => v === null || (typeof v === 'number' && Number.isSafeInteger(v) && v >= 0);
const currency = (v: unknown) => v === 'COP' || v === 'USD';
export function validateLab(body: unknown): string | null {
  if (!record(body) || !Number.isSafeInteger(body.revision) || body.revision < 0 || !record(body.data)) return 'Formato de laboratorio inválido.';
  const d = body.data;
  if (!record(d.meta) || !arrays.every(k => Array.isArray(d[k]) && d[k].length <= 5000 && d[k].every((r: unknown) => record(r) && typeof r.id === 'string' && r.id.trim().length > 0 && r.id.length <= 200) && new Set(d[k].map((r: Row) => r.id)).size === d[k].length)) return 'Revisa las colecciones y los identificadores del laboratorio.';
  if (!d.components.every((r: Row) => typeof r.name === 'string' && r.name.trim() && quantity(r.quantity) && quantity(r.received) && amount(r.cost) && optionalAmount(r.marketValue))) return 'Revisa nombres, cantidades y costos de los componentes.';
  if (!d.expenses.every((r: Row) => typeof r.provider === 'string' && r.provider.trim() && typeof r.concept === 'string' && r.concept.trim() && optionalAmount(r.amount) && optionalAmount(r.amountCOP) && currency(r.currency))) return 'Revisa los importes y las monedas de las facturas.';
  const invoices = new Set<string>();
  for (const r of d.expenses) {
    if (r.invoice != null && typeof r.invoice !== 'string') return 'La referencia de factura debe ser texto.';
    if (r.invoice?.trim()) {
      const key = r.provider.trim().toLowerCase() + '|' + r.invoice.trim().toLowerCase();
      if (invoices.has(key)) return 'Factura duplicada para un mismo proveedor.';
      invoices.add(key);
    }
  }
  if (!d.subscriptions.every((r: Row) => optionalAmount(r.unitPrice) && quantity(r.quantity) && optionalAmount(r.marketUnit) && currency(r.currency))) return 'Revisa tarifas, unidades y monedas de las suscripciones.';
  if (!d.apiFunds.every((r: Row) => optionalAmount(r.amount) && optionalAmount(r.balance) && optionalAmount(r.unitPrice) && (r.quantity === undefined || quantity(r.quantity)) && currency(r.currency))) return 'Revisa los montos y saldos de APIs.';
  if (!d.providerBudgets.every((r: Row) => optionalAmount(r.monthlyBudgetCOP))) return 'Revisa los presupuestos.';
  if (!d.softwareModules.every((r: Row) => typeof r.stage === 'string' && typeof r.name === 'string' && typeof r.hoursLow === 'number' && typeof r.hoursHigh === 'number' && Number.isFinite(r.hoursLow) && Number.isFinite(r.hoursHigh) && r.hoursLow >= 0 && r.hoursHigh >= r.hoursLow)) return 'Revisa los rangos de horas.';
  if (!record(d.softwareRates) || ![d.softwareRates.low, d.softwareRates.base, d.softwareRates.high].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0) || d.softwareRates.low > d.softwareRates.base || d.softwareRates.base > d.softwareRates.high) return 'Tarifas de software inválidas.';
  return null;
}

type Row=Record<string,any>;
export const amountOf=(row:Row)=>row.amount==null?null:Number(row.amount);
export function paidTotals(rows:Row[]){const paid=rows.filter(r=>r.status==='Pagado');return {cop:paid.reduce((n,r)=>n+(r.amountCOP??(r.currency==='COP'?r.amount:0)??0),0),usd:paid.filter(r=>r.currency==='USD'&&r.amountCOP==null).reduce((n,r)=>n+(r.amount??0),0),unknown:paid.filter(r=>r.amount==null&&r.amountCOP==null).length}}
export function subscriptionTotal(row:Row){return row.unitPrice==null||row.quantity==null?null:row.unitPrice*row.quantity}
export function monthlyCost(row:Row){if(row.active==='Cancelada')return null;const total=subscriptionTotal(row);if(total===null)return null;if(row.period==='Mensual')return total;if(row.period==='Anual')return total/12;return null}
export function estimateSoftware(rows:Row[],rates:{low:number;base:number;high:number}){return {low:rows.reduce((n,r)=>n+r.hoursLow,0)*rates.low,base:rows.reduce((n,r)=>n+(r.hoursLow+r.hoursHigh)/2,0)*rates.base,high:rows.reduce((n,r)=>n+r.hoursHigh,0)*rates.high,hoursLow:rows.reduce((n,r)=>n+r.hoursLow,0),hoursHigh:rows.reduce((n,r)=>n+r.hoursHigh,0)}}

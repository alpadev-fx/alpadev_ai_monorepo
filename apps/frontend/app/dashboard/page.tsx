"use client";

import React from "react";
import { Widget } from "../_components/dashboard/Widget";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-400">Welcome back to your command center.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Widget title="Total Revenue" delay={0.1}>
          <div className="mt-2 text-3xl font-bold">$124,500.50</div>
          <div className="mt-1 text-sm text-emerald-400">+12.5% from last month</div>
        </Widget>
        <Widget title="Outstanding Invoices" delay={0.2}>
          <div className="mt-2 text-3xl font-bold">$34,200.00</div>
          <div className="mt-1 text-sm text-zinc-500">5 invoices pending</div>
        </Widget>
        <Widget title="Active Projects" delay={0.3}>
          <div className="mt-2 text-3xl font-bold">12</div>
          <div className="mt-1 text-sm text-zinc-500">3 due this week</div>
        </Widget>
        <Widget title="Total Expenses" delay={0.4}>
           <div className="mt-2 text-3xl font-bold">$12,450.00</div>
           <div className="mt-1 text-sm text-rose-400">+4.2% from last month</div>
        </Widget>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Widget title="Recent Activity" className="lg:col-span-2" delay={0.5}>
          <div className="space-y-4">
             {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/5" />
                      <div>
                         <div className="text-sm font-medium">Payment received</div>
                         <div className="text-xs text-zinc-500">From Acme Corp Inc.</div>
                      </div>
                   </div>
                   <div className="text-sm font-medium text-emerald-400">+$1,200.00</div>
                </div>
             ))}
          </div>
        </Widget>
        <Widget title="Quick Actions" delay={0.6}>
           <div className="grid grid-cols-2 gap-3">
              <button className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                 <span className="h-6 w-6 rounded-full border border-white/20" />
                 <span className="text-xs text-zinc-400">New Invoice</span>
              </button>
              <button className="flex h-20 w-full flex-col items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                 <span className="h-6 w-6 rounded-full border border-white/20" />
                 <span className="text-xs text-zinc-400">Add Bill</span>
              </button>
           </div>
        </Widget>
      </div>
    </div>
  );
}

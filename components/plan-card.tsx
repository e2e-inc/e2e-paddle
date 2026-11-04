import type { ReactNode } from "react";

import { formatUsd, PLAN } from "@/lib/plan";

export function PlanCard({ children }: { children: ReactNode }) {
  const price = formatUsd(PLAN.amount);

  return (
    <section
      aria-labelledby="plan-heading"
      className="flex flex-col gap-e2e-3 border border-e2e-neutral-800 bg-e2e-neutral-800/40 p-e2e-3"
    >
      <h2 id="plan-heading" className="type-h5 text-e2e-off-white">
        {PLAN.name}
      </h2>

      <p className="flex items-baseline gap-e2e-1">
        <span className="type-number-l text-e2e-off-white">{price}</span>
        <span className="type-body-m text-e2e-neutral-400">/ {PLAN.interval}</span>
      </p>

      <dl className="flex flex-col gap-e2e-2 border-t border-e2e-neutral-800 pt-e2e-3 type-body-m">
        <div className="flex justify-between gap-e2e-2 text-e2e-off-white">
          <dt>due today</dt>
          <dd data-testid="due-today">{price}</dd>
        </div>
        <div className="flex justify-between gap-e2e-2 text-e2e-neutral-300">
          <dt>then</dt>
          <dd>
            {price}/{PLAN.interval}
          </dd>
        </div>
      </dl>

      {children}
      <p className="type-body-s text-e2e-neutral-500">Paddle&apos;s checkout opens over this page.</p>
    </section>
  );
}

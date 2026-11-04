import { ApiError, type Transaction } from "@paddle/paddle-node-sdk";
import Link from "next/link";
import { connection } from "next/server";
import { setTimeout as sleep } from "node:timers/promises";
import { Suspense } from "react";

import { ResultPanel } from "@/components/result-panel";
import { buttonClassName } from "@/components/ui/button";
import { getPaddle } from "@/lib/paddle";
import { formatUsd } from "@/lib/plan";

export default function ReturnPage({ searchParams }: PageProps<"/return">) {
  return (
    <main className="flex flex-1 flex-col justify-center px-e2e-3 py-e2e-8 md:px-e2e-6">
      <div className="mx-auto flex w-full max-w-105 flex-col gap-e2e-2">
        <Suspense fallback={<ResultPanel pending status="checking…" detail="asking Paddle about this payment." />}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
        <Link href="/" className={buttonClassName("outline", "w-full")}>
          back to checkout
        </Link>
      </div>
    </main>
  );
}

async function PaymentResult({ searchParams }: Pick<PageProps<"/return">, "searchParams">) {
  const { transaction_id: transactionId } = await searchParams;
  if (typeof transactionId !== "string") {
    return <ResultPanel status="no payment" detail="Paddle sends you here after you pay." />;
  }

  // Prerendering can resolve searchParams; Paddle must only be asked per request.
  await connection();
  const transaction = await getProcessedTransaction(transactionId);
  if (!transaction) {
    return <ResultPanel status="not found" detail="Paddle has no transaction with this id." />;
  }

  if (transaction.status !== "paid" && transaction.status !== "completed") {
    return (
      <ResultPanel
        status="not paid"
        detail="Paddle has no payment for this checkout."
        rows={[
          { label: "transaction", value: transaction.id, mono: true },
          { label: "Paddle status", value: transaction.status },
        ]}
      />
    );
  }

  const price = transaction.items[0]?.price;
  const planName = transaction.details?.lineItems[0]?.product?.name ?? "unknown";
  const charged = formatUsd(Number(transaction.details?.totals?.grandTotal ?? 0));
  const paidBy = transaction.customer?.email ? ` by ${transaction.customer.email}` : "";

  if (!transaction.subscriptionId) {
    return (
      <ResultPanel
        status="paid"
        detail={`${charged} paid${paidBy}.`}
        rows={[
          { label: "plan", value: planName },
          { label: "transaction", value: transaction.id, mono: true },
        ]}
      />
    );
  }

  const subscription = await getPaddle().subscriptions.get(transaction.subscriptionId);
  const recurring = price ? `${formatUsd(Number(price.unitPrice.amount))}/${price.billingCycle?.interval}` : "";
  const nextBill = subscription.nextBilledAt ? new Date(subscription.nextBilledAt) : null;

  return (
    <ResultPanel
      status="subscribed"
      detail={`${planName}, ${recurring}, paid${paidBy}.`}
      rows={[
        { label: "plan", value: planName },
        { label: "paid today", value: charged },
        { label: "next bill", value: nextBill ? longDate(nextBill) : "none" },
        { label: "subscription", value: subscription.id, mono: true },
      ]}
    />
  );
}

// Paddle redirects before it has finished: wait up to 10 s for "completed" and the subscription.
async function getProcessedTransaction(id: string): Promise<Transaction | null> {
  for (let attempt = 1; ; attempt++) {
    const transaction = await getTransaction(id);
    const recurring = transaction?.items.some((item) => item.price?.billingCycle);
    const processing =
      transaction?.status === "ready" ||
      transaction?.status === "paid" ||
      (transaction?.status === "completed" && recurring && !transaction.subscriptionId);
    if (!processing || attempt === 10) return transaction;
    await sleep(1000);
  }
}

async function getTransaction(id: string): Promise<Transaction | null> {
  try {
    return await getPaddle().transactions.get(id, { include: ["customer"] });
  } catch (error) {
    if (error instanceof ApiError && (error.code === "not_found" || error.code === "invalid_url")) return null;
    throw error;
  }
}

function longDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toLowerCase();
}

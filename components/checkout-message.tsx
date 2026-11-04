import clsx from "clsx";

export function CheckoutMessage({ kind, children }: { kind: "notice" | "error"; children: string }) {
  const error = kind === "error";

  return (
    <p
      role={error ? "alert" : "status"}
      data-testid={error ? "checkout-error" : "checkout-notice"}
      className={clsx(
        "border bg-e2e-neutral-800/40 px-e2e-3 py-e2e-2 type-body-s",
        error ? "border-e2e-mint text-e2e-mint" : "border-e2e-neutral-800 text-e2e-neutral-300",
      )}
    >
      {children}
    </p>
  );
}

import { PlanCheckout } from "@/components/plan-checkout";

export default function CheckoutPage() {
  return (
    <main className="flex flex-1 flex-col justify-center py-e2e-8">
      <div className="mx-auto grid w-full max-w-312 items-center gap-e2e-8 px-e2e-3 md:px-e2e-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-e2e-10">
        <div>
          <p className="type-caption text-e2e-mint">paddle example</p>
          <h1 className="mt-e2e-2 type-h1 text-e2e-off-white">
            Paddle checkout,
            <br />
            tested end to end
          </h1>
          <p className="mt-e2e-3 max-w-120 type-body-l text-e2e-neutral-400">
            a real Paddle subscription in a sandbox, tested with e2e: in the browser, and against what Paddle recorded.
          </p>
          <p className="mt-e2e-4 type-caption text-e2e-neutral-500">
            test card 4242 4242 4242 4242, any future expiry, cvc 100.
          </p>
        </div>

        <PlanCheckout />
      </div>
    </main>
  );
}

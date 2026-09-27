// Payments abstraction. This demo never moves real money — there is no
// real payment provider, only a mock that simulates success so future
// phases (e.g. a program registration flow) have something to call.

export interface PaymentResult {
  success: boolean;
  transactionId: string;
}

export interface PaymentProvider {
  readonly name: string;
  charge(amountCents: number, description: string): Promise<PaymentResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async charge(amountCents: number, description: string): Promise<PaymentResult> {
    void amountCents;
    void description;
    return {
      success: true,
      transactionId: `mock-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new MockPaymentProvider();
}

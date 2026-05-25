/// <reference types="vite/client" />

type PaystackTransaction = {
  reference?: string;
  status?: string;
  transaction?: string;
  trxref?: string;
};

type PaystackCheckoutOptions = {
  key: string;
  email: string;
  amount: number;
  currency: "GHS";
  channels: Array<"mobile_money" | "card" | "bank_transfer" | "ussd" | "qr" | "bank" | "eft">;
  firstName?: string;
  lastName?: string;
  phone?: string;
  reference: string;
  metadata: Record<string, unknown>;
  onSuccess: (transaction: PaystackTransaction) => void;
  onCancel: () => void;
  onError: (error: { message?: string }) => void;
};

interface ImportMetaEnv {
  readonly VITE_PAYSTACK_PUBLIC_KEY?: string;
  readonly VITE_PAYMENT_API_BASE_URL?: string;
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: { immediate?: boolean }): (reloadPage?: boolean) => Promise<void>;
}

interface Window {
  PaystackPop?: new () => {
    newTransaction: (options: PaystackCheckoutOptions) => void;
  };
}

/// <reference types="vite/client" />

declare module '@paystack/inline-js' {
  const PaystackPop: new () => {
    resumeTransaction: (
      accessCode: string,
      handlers: { onSuccess?: (transaction: { reference: string }) => void; onCancel?: () => void }
    ) => void
  }
  export default PaystackPop
}

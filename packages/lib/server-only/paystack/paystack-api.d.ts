declare module 'paystack-api' {
  // You can provide a basic or custom type declaration for Paystack here.
  // For example, if you're using it as a default export, you can declare it as:
  
  const Paystack: any;
  export default Paystack;

  export function createClient(secretKey: string): {
    transaction: {
      initialize: (options: any) => Promise<any>;
      verify: (reference: string) => Promise<any>;
    };
  };
}

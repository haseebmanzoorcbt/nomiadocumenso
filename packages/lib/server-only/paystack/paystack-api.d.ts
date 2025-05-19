declare module 'paystack-api' {
  interface PaystackInstance {
    transaction: {
      initialize(data: any): Promise<any>;
      verify(reference: string): Promise<any>;
      // Add other methods as needed
    };
    // Add other Paystack APIs as needed
  }
  
  function Paystack(secretKey: string): PaystackInstance;
  
  export default Paystack;
}
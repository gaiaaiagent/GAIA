// APICallError.ts
export class APICallError extends Error {
    public originalError: any;
  
    constructor(message: string, originalError: any) {
      super(message);
      this.originalError = originalError;
    }
  
    static isAPICallError(err: any): boolean {
      return err instanceof APICallError;
    }
  }
  
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      auth?: import("@findbuddy/types").AuthPrincipal;
    }
  }
}

export {};

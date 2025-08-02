// Global type declarations

declare module 'zustand' {
  export function create<T>(
    createState: (
      set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void,
      get: () => T
    ) => T
  ): () => T;
}

declare module 'zustand/middleware' {
  export function persist<T>(
    config: any,
    options?: any
  ): any;
}
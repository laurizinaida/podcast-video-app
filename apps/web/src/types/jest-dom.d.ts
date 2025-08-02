import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeVisible(): R;
      toHaveValue(value: string | number | string[]): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(className: string): R;
    }
  }
}
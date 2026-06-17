"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: string }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Must not swallow Next.js redirect() — it throws NEXT_REDIRECT by design. */
export default class AdminLoginErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State | null {
    if (isNextRedirect(error)) return null;
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isNextRedirect(error)) {
      throw error;
    }
    console.error("[LOGIN] React error boundary", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <p className="text-sm text-red-600">
          Login UI crashed: {this.state.error.message}. Check console for details.
        </p>
      );
    }
    return this.props.children;
  }
}

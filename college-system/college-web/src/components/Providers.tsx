"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ToastContainer } from "@/components/ui/Toast";
import { useToastStore } from "@/hooks/useToast";

function GlobalToastRenderer() {
  const { toasts, dismiss } = useToastStore();
  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <GlobalToastRenderer />
    </QueryClientProvider>
  );
}

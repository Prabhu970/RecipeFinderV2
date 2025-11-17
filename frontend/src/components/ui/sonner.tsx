import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      richColors
      closeButton
      position="top-right"
      duration={3000}
      expand
    />
  );
}

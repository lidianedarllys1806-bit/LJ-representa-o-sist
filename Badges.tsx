import { cn } from "@/lib/utils";

export type Prioridade = "alta" | "media" | "baixa";

const prioridadeConfig: Record<Prioridade, { label: string; dot: string; text: string }> = {
  alta: { label: "Alta", dot: "bg-danger", text: "text-danger" },
  media: { label: "Média", dot: "bg-warning", text: "text-warning" },
  baixa: { label: "Baixa", dot: "bg-primary", text: "text-primary" },
};

export function PrioridadeBadge({ prioridade }: { prioridade: Prioridade }) {
  const c = prioridadeConfig[prioridade];
  return (
    <span className={cn("flex items-center gap-1.5 text-[12px] font-medium", c.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const toneMap = {
    neutral: "bg-bg text-muted",
    success: "bg-success-light text-primary-dark",
    warning: "bg-warning-light text-warning",
    danger: "bg-danger-light text-danger",
    info: "bg-info-light text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        toneMap[tone]
      )}
    >
      {children}
    </span>
  );
}

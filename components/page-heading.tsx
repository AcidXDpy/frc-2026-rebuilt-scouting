import { cn } from "@/lib/utils";

export function PageHeading({ eyebrow, title, description, className }: { eyebrow?: string; title: string; description: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-primary/25 bg-[#050505] p-5 text-white shadow-[0_18px_55px_rgba(0,0,0,0.22)]", className)}>
      <div className="gold-rule -mx-5 -mt-5 mb-5" />
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p> : null}
      <h1 className="mt-1 text-3xl font-black tracking-normal">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-300">{description}</p>
    </div>
  );
}

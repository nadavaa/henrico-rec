import { ResidentNav } from "@/components/resident/resident-nav";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <ResidentNav />
      {children}
    </div>
  );
}

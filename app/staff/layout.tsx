import { StaffNav } from "@/components/staff/staff-nav";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <StaffNav />
      {children}
    </div>
  );
}

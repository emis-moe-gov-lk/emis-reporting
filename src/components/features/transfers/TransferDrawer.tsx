"use client";

import { Check, Download, Minus } from "lucide-react";
import { TransferApplication } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { excelExport, printHtml } from "@/lib/exportHelpers";

const statusMeta: Record<
TransferApplication["status"],
{ label: string; variant: "success" | "warning" | "destructive" }
> = {
full: { label: "Full", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  pending: { label: "Pending", variant: "destructive" },
};

const CHECKLIST_LABELS = [
  "Application form submitted",
  "Service extract attached",
  "Medical certificate attached",
  "Zonal director recommendation",
];

/**
 * Transfer application detail — standard right-hand sheet with an overlay,
 * Escape-to-close, focus trap and scroll lock (Radix Dialog underneath).
 * Full width on mobile, fixed panel from `sm` up.
 */
export function TransferDrawer({
  app: r,
  onClose,
}: {
  app: TransferApplication;
  onClose: () => void;
}) {
  const done =
    r.status === "full"
      ? [1, 1, 1, 1]
      : r.status === "partial"
        ? [1, 1, 0, 0]
        : [1, 0, 0, 0];

  const status = statusMeta[r.status];

  function excelRow() {
    return [
      ["Field", "Value"],
      ["Name", r.name],
      ["NIC", r.nic],
      ["DOB", r.dob],
      ["Current school", r.currentSchool],
      ["Current zone", r.currentZone],
      ["Subject", r.subject],
      ["Current appointment subject", r.apptSubject],
      ["First appointment date", r.firstDate],
      ["First appointment school", r.firstSchool],
      ["Current appointment date", r.currentDate],
      ["Service years", r.serviceYears],
      ["Target province", r.targetProvince ?? "—"],
      ["Target zonal", r.targetZone ?? "—"],
      ["Target schools", r.schools.join("; ")],
      ["Status", r.status],
    ];
  }

  return (
    <Sheet defaultOpen onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        aria-describedby={undefined}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl lg:max-w-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5 pr-12">
          <div className="min-w-0">
            <SheetTitle className="truncate text-lg">{r.name}</SheetTitle>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {r.nic} · DOB {r.dob}
            </p>
          </div>
          <Badge variant={status.variant} className="mt-0.5 shrink-0">
            {status.label}
          </Badge>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Service history */}
          <Section title="Service history">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field l="First appointment date" v={r.firstDate} />
              <Field l="First appointment school" v={r.firstSchool} />
              <Field l="Current appointment date" v={r.currentDate} />
              <Field l="Current appointment subject" v={r.apptSubject} />
              <Field l="School service years" v={`${r.serviceYears} years`} />
              <Field l="Teaching subject" v={r.subject} />
              <Field l="Current school" v={r.currentSchool} />
              <Field l="Current zonal" v={r.currentZone} />
            </div>
          </Section>

          {/* Transfer target */}
          {(r.targetProvince || r.targetZone) && (
            <Section title="Transfer target">
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {r.targetProvince && <Field l="Target province" v={r.targetProvince} />}
                {r.targetZone && <Field l="Target zonal" v={r.targetZone} />}
              </div>
            </Section>
          )}

          {/* Target schools */}
          <Section title="Applied / target schools (preference order)">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {r.schools.map((school, index) => (
                <li
                  key={school}
                  className="flex items-center gap-3 rounded-lg bg-muted px-3 py-3 text-[13px] text-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span>{school}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Application completeness */}
          <Section title="Application completeness">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CHECKLIST_LABELS.map((label, index) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 text-[13px] text-foreground"
                  >
                    <span
                      className={
                        done[index]
                          ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
                          : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground"
                      }
                    >
                      {done[index] ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Status */}
          <Section title="Application status">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <span className="text-[11px] text-muted-foreground">Current status</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          </Section>
        </div>

        {/* Footer actions */}
        <div className="flex shrink-0 items-center gap-2 border-t bg-card px-6 py-4">
          <Button size="sm" onClick={() => excelExport(`${r.nic}-transfer`, excelRow())}>
            <Download />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              printHtml(
                r.name,
                `
                  <table>
                    <tr>
                      <td>Current school</td>
                      <td>${r.currentSchool} (${r.currentZone} zone)</td>
                    </tr>

                    <tr>
                      <td>Subject / appointment</td>
                      <td>${r.subject} / ${r.apptSubject}</td>
                    </tr>

                    <tr>
                      <td>First appointment</td>
                      <td>${r.firstDate} — ${r.firstSchool}</td>
                    </tr>

                    <tr>
                      <td>Current appointment date</td>
                      <td>${r.currentDate}</td>
                    </tr>

                    <tr>
                      <td>Service years</td>
                      <td>${r.serviceYears}</td>
                    </tr>

                    ${
                      r.targetProvince
                        ? `
                          <tr>
                            <td>Target province</td>
                            <td>${r.targetProvince}</td>
                          </tr>
                        `
                        : ""
                    }

                    ${
                      r.targetZone
                        ? `
                          <tr>
                            <td>Target zonal</td>
                            <td>${r.targetZone}</td>
                          </tr>
                        `
                        : ""
                    }

                    <tr>
                      <td>Target schools</td>
                      <td>${r.schools.join(", ")}</td>
                    </tr>

                    <tr>
                      <td>Status</td>
                      <td>${r.status}</td>
                    </tr>
                  </table>
                `
              )
            }
          >
            <Download />
            PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7 last:mb-0">
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Field({ l, v }: { l: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] text-muted-foreground">{l}</div>
      <div className="break-words text-[13.5px] font-medium text-foreground">{v}</div>
    </div>
  );
}

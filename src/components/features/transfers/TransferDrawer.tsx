"use client";

import { X } from "lucide-react";
import { TransferApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { excelExport, printHtml } from "@/lib/exportHelpers";

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

  const labels = [
    "Application form submitted",
    "Service extract attached",
    "Medical certificate attached",
    "Zonal director recommendation",
  ];

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
    <div
      className="fixed inset-0 z-20 flex items-stretch justify-end bg-black/45"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* =====================================================
          DRAWER — flush left edge: no shadow, no border strip,
          no gap between the page overlay and the panel.
      ====================================================== */}
      <div
        className="
          flex
          h-full
          w-full
          flex-col
          border-l-0
          bg-card
          shadow-none

          sm:w-[600px]
          lg:w-[720px]
          xl:w-[780px]

          dark:bg-slate-900
        "
      >
        {/* ===================================================
            HEADER
        ==================================================== */}
        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-border
            px-6
            py-5
            dark:border-slate-700
          "
        >
          <div className="min-w-0 pr-4">
            <h3 className="text-[21px] font-semibold text-foreground dark:text-slate-100">
              {r.name}
            </h3>

            <div className="mt-1 text-[12.5px] text-muted-foreground dark:text-slate-400">
              {r.nic} · DOB {r.dob}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              text-muted-foreground
              transition
              hover:bg-muted
              hover:text-foreground
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-slate-100
            "
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* =================================================
              SERVICE HISTORY
          ================================================== */}
          <Section title="Service history">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field
                l="First appointment date"
                v={r.firstDate}
              />

              <Field
                l="First appointment school"
                v={r.firstSchool}
              />

              <Field
                l="Current appointment date"
                v={r.currentDate}
              />

              <Field
                l="Current appointment subject"
                v={r.apptSubject}
              />

              <Field
                l="School service years"
                v={`${r.serviceYears} years`}
              />

              <Field
                l="Teaching subject"
                v={r.subject}
              />

              <Field
                l="Current school"
                v={r.currentSchool}
              />

              <Field
                l="Current zonal"
                v={r.currentZone}
              />
            </div>
          </Section>

          {/* =================================================
              TRANSFER TARGET
          ================================================== */}
          {(r.targetProvince || r.targetZone) && (
            <Section title="Transfer target">
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {r.targetProvince && (
                  <Field
                    l="Target province"
                    v={r.targetProvince}
                  />
                )}

                {r.targetZone && (
                  <Field
                    l="Target zonal"
                    v={r.targetZone}
                  />
                )}
              </div>
            </Section>
          )}

          {/* =================================================
              TARGET SCHOOLS
          ================================================== */}
          <Section title="Applied / target schools (preference order)">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {r.schools.map((school, index) => (
                <li
                  key={school}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    bg-muted
                    px-3
                    py-3
                    text-[13px]
                    text-foreground

                    dark:bg-slate-800
                    dark:text-slate-200
                  "
                >
                  <span
                    className="
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-primary
                      text-[11px]
                      font-semibold
                      text-white
                    "
                  >
                    {index + 1}
                  </span>

                  <span>{school}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* =================================================
              APPLICATION COMPLETENESS
          ================================================== */}
          <Section title="Application completeness">
            <div
              className="
                rounded-lg
                border
                border-border
                bg-muted
                p-4
                dark:border-slate-700
                dark:bg-slate-800/50
              "
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {labels.map((label, index) => (
                  <div
                    key={label}
                    className="
                      flex
                      items-center
                      gap-3
                      text-[13px]
                      text-foreground
                      dark:text-slate-200
                    "
                  >
                    <span
                      className={`
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        text-[10px]
                        font-semibold
                        text-white
                        ${
                          done[index]
                            ? "bg-green-600"
                            : "bg-border text-muted-foreground dark:bg-slate-700"
                        }
                      `}
                    >
                      {done[index] ? "✓" : "—"}
                    </span>

                    {label}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* =================================================
              STATUS
          ================================================== */}
          <Section title="Application status">
            <div className="rounded-lg border border-border bg-muted px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-[11px] text-muted-foreground dark:text-slate-400">
                Current status
              </div>

              <div className="mt-1 text-sm font-semibold text-foreground dark:text-slate-100">
                {r.status}
              </div>
            </div>
          </Section>
        </div>

        {/* ===================================================
            FOOTER ACTIONS
        ==================================================== */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            border-t
            border-border
            bg-card
            px-6
            py-4
            dark:border-slate-700
            dark:bg-slate-900
          "
        >
          <Button
            onClick={() =>
              excelExport(
                `${r.nic}-transfer`,
                excelRow()
              )
            }
          >
            ↓ Excel
          </Button>

          <Button
            variant="outline"
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
            ↓ PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7 last:mb-0">
      <h4
        className="
          mb-3
          text-[11px]
          font-semibold
          uppercase
          tracking-wide
          text-muted-foreground
          dark:text-slate-400
        "
      >
        {title}
      </h4>

      {children}
    </section>
  );
}

function Field({
  l,
  v,
}: {
  l: string;
  v: string;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-[11px] text-muted-foreground dark:text-slate-400">
        {l}
      </div>

      <div className="break-words text-[13.5px] font-medium text-foreground dark:text-slate-200">
        {v}
      </div>
    </div>
  );
}
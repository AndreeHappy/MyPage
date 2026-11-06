import React from "react";
import { HandHeart, MapPin, CalendarBlank } from "@phosphor-icons/react";
import profileData from "../data/profile.json";

export default function Leadership() {
  return (
    <section
      id="liderazgo"
      className="relative z-10 py-24 border-t transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg)",
        borderColor: "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold font-title">
            Liderazgo & Voluntariado
          </h2>
          <div
            className="h-1 w-20 rounded-full mt-3"
            style={{ backgroundColor: "var(--fg)" }}
          />
        </div>

        <div className="flex flex-col gap-10">
          {profileData.leadership?.map((item, index) => (
            <div
              key={index}
              className="p-6 sm:p-8 rounded-2xl border transition-all"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-color)"
              }}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div
                  className="hidden md:flex p-4 rounded-2xl border flex-shrink-0"
                  style={{
                    backgroundColor: "var(--fg)",
                    color: "var(--bg)",
                    borderColor: "var(--fg)"
                  }}
                >
                  <HandHeart size={32} weight="duotone" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                    <div>
                      <h3 className="text-xl font-bold font-title flex items-center gap-3">
                        <span className="md:hidden">
                          <HandHeart size={24} weight="duotone" />
                        </span>
                        {item.organization}
                      </h3>
                      <p
                        className="font-mono text-sm mt-1 font-semibold"
                        style={{ color: "var(--fg-muted)" }}
                      >
                        {item.role}
                      </p>
                    </div>

                    <div
                      className="flex flex-col items-start md:items-end gap-1 text-xs font-mono"
                      style={{ color: "var(--fg-subtle)" }}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarBlank size={15} />
                        <span>{item.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={15} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <p
                    className="text-sm leading-relaxed mt-4 max-w-3xl"
                    style={{ color: "var(--fg-muted)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

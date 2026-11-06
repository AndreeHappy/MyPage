import React from "react";
import {
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
  YoutubeLogo,
  InstagramLogo,
  EnvelopeSimple,
  Phone,
  MapPin
} from "@phosphor-icons/react";
import profileData from "../data/profile.json";
import AASALogo from "./AASALogo";

function OrcidLogo({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M128,0A128,128,0,1,0,256,128,128,128,0,0,0,128,0ZM86.35,186.26H64.71V81.42H86.35ZM75.53,67.75A12.55,12.55,0,1,1,88.08,55.2,12.55,12.55,0,0,1,75.53,67.75Zm116.14,64.44c0,28.29-19.46,41.9-44.48,41.9H107.57V81.42h40.42C172.48,81.42,191.67,96.65,191.67,132.19Zm-22.37,0c0-21.22-11.41-29.35-26.69-29.35H129.21v58.7h13.4C157.89,161.54,169.3,153.41,169.3,132.19Z" />
    </svg>
  );
}

export default function Footer() {
  const { name, title, email, phone, location, social } = profileData;

  return (
    <footer
      id="contacto"
      data-snap-section="footer"
      className="relative z-10 min-h-[100dvh] border-t py-20 sm:py-24 flex flex-col justify-between transition-colors duration-300"
      style={{
        backgroundColor: "transparent",
        borderColor: "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      <div
        className="max-w-7xl w-full mx-auto px-6 my-auto ocean-sway-gentle"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl sm:text-5xl font-bold font-title mb-3">
              {name}
            </h2>
            <p
              className="font-mono text-base sm:text-lg"
              style={{ color: "var(--fg-muted)" }}
            >
              {title}
            </p>
          </div>

          <div className="flex flex-col md:items-end">
            <h3 className="font-bold font-title mb-6 text-2xl">Contacto</h3>
            <ul
              className="space-y-4 text-sm sm:text-base font-mono"
              style={{ color: "var(--fg-muted)" }}
            >
              <li className="flex items-center gap-3 justify-start md:justify-end">
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
                <EnvelopeSimple size={20} />
              </li>
              <li className="flex items-center gap-3 justify-start md:justify-end">
                <a href={`tel:+51${phone}`} className="hover:underline">
                  +51 {phone}
                </a>
                <Phone size={20} />
              </li>
              <li className="flex items-center gap-3 justify-start md:justify-end">
                <span>{location}</span>
                <MapPin size={20} />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        className="max-w-7xl w-full mx-auto px-6 ocean-sway-gentle"
      >
        <div
          className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-6"
          style={{ borderColor: "var(--border-color)" }}
        >
          <p
            className="text-xs font-mono text-center md:text-left"
            style={{ color: "var(--fg-subtle)" }}
          >
            &copy; 2026 Andree Aarom Sosa Ardiles. Todos los derechos reservados.
          </p>

          <div className="flex items-center justify-center">
            <AASALogo scale={1.05} />
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {social?.linkedin && (
              <a
                href={social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:opacity-100 opacity-75 hover:scale-110"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedinLogo size={22} weight="duotone" />
              </a>
            )}
            {social?.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:opacity-100 opacity-75 hover:scale-110"
                aria-label="GitHub"
                title="GitHub"
              >
                <GithubLogo size={22} weight="duotone" />
              </a>
            )}
            {social?.orcid && (
              <a
                href={social.orcid}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:opacity-100 opacity-75 hover:scale-110"
                aria-label="ORCID"
                title="ORCID (Perfil Académico)"
              >
                <OrcidLogo size={20} />
              </a>
            )}
            {social?.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:opacity-100 opacity-75 hover:scale-110"
                aria-label="YouTube"
                title="YouTube"
              >
                <YoutubeLogo size={22} weight="duotone" />
              </a>
            )}
            {social?.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:opacity-100 opacity-75 hover:scale-110"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramLogo size={22} weight="duotone" />
              </a>
            )}
            {social?.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200 hover:opacity-100 opacity-75 hover:scale-110"
                aria-label="Facebook"
                title="Facebook"
              >
                <FacebookLogo size={22} weight="duotone" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

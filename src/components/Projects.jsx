import React, { useRef, useEffect, useState } from "react";

const projectsList = [
  {
    id: 1,
    aspectRatio: "aspect-[16/10]",
    video: "/videos/galeria1.mp4"
  },
  {
    id: 2,
    aspectRatio: "aspect-[4/3]",
    video: "/videos/galeria1.mp4"
  },
  {
    id: 3,
    aspectRatio: "aspect-[16/9]",
    video: "/videos/galeria1.mp4"
  },
  {
    id: 4,
    aspectRatio: "aspect-[3/4]",
    video: "/videos/galeria1.mp4"
  },
  {
    id: 5,
    aspectRatio: "aspect-[16/10]",
    video: "/videos/galeria1.mp4"
  },
  {
    id: 6,
    aspectRatio: "aspect-[4/3]",
    video: "/videos/galeria1.mp4"
  }
];

function ProjectVideoCard({ project, isHovered, isDimmed, onHover, onLeave, onToggle }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isHovered) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isHovered]);

  return (
    <div
      onClick={onToggle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-500 cursor-pointer ${
        isDimmed
          ? "filter grayscale contrast-90 opacity-25 scale-[0.98] pointer-events-auto"
          : isHovered
          ? "scale-[1.02] shadow-2xl z-20 border-[var(--fg)]"
          : "opacity-100 scale-100"
      }`}
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: isHovered ? "var(--fg)" : "var(--border-color)",
        color: "var(--fg)"
      }}
    >
      {/* Video Screen in Frame (Only the video) */}
      <div
        className={`relative w-full overflow-hidden ${project.aspectRatio} flex items-center justify-center`}
        style={{ backgroundColor: "#060606" }}
      >
        {project.video && (
          <video
            ref={videoRef}
            src={project.video}
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
      </div>
    </div>
  );
}

export default function Projects() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section
      id="proyectos"
      className="relative z-10 pt-28 pb-24 transition-colors duration-300 min-h-screen"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)"
      }}
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Clean Header: Only Title */}
        <div
          className="mb-12 pb-6 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-title tracking-tight text-[var(--fg)]">
            Proyectos
          </h1>
        </div>

        {/* Up to 3 Columns Grid (varied sizes & grayscale hover interaction) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {projectsList.map((project) => (
            <ProjectVideoCard
              key={project.id}
              project={project}
              isHovered={hoveredId === project.id}
              isDimmed={hoveredId !== null && hoveredId !== project.id}
              onHover={() => setHoveredId(project.id)}
              onLeave={() => setHoveredId(null)}
              onToggle={() =>
                setHoveredId((prev) => (prev === project.id ? null : project.id))
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

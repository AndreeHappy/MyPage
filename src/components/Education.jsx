import { motion } from 'framer-motion';
import { GraduationCap } from '@phosphor-icons/react';
import profileData from '../data/profile.json';

const Education = () => {
  // Access data from profile.json if it exists, otherwise use fallback data based on requirements
  const eduData = profileData.education || [];
  const edu = eduData.length > 0 ? eduData[0] : {
    institution: "Universidad Nacional de Moquegua (UNAM)",
    degree: "Ingenieria de Sistemas e Informatica",
    period: "Abr 2020 - Dic 2024",
    extra: "Bachiller en Ingenieria de Sistemas e Informatica - 22 Sep 2025",
    location: "Ilo, Peru"
  };

  return (
    <section id="educacion" className="bg-[#0c0c0e] py-24 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <div className="w-12 h-1 bg-teal-500 mb-4 rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">Educacion</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="max-w-3xl border border-zinc-800 rounded-2xl p-8 bg-[#121214] relative overflow-hidden"
        >
          {/* Subtle gradient effect in the corner */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
            <div className="flex-shrink-0 mt-1">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20">
                <GraduationCap size={32} weight="duotone" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div>
                <h3 className="text-xl font-semibold text-zinc-100">{edu.institution}</h3>
                <p className="text-lg text-teal-500 font-medium mt-1">{edu.degree}</p>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                  {edu.period}
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                  {edu.location}
                </span>
              </div>
              
              {edu.extra && (
                <div className="mt-5 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-sm text-zinc-300">
                  <span className="text-zinc-400 block mb-1 text-xs uppercase tracking-wider font-medium">Informacion Adicional</span>
                  <span>{edu.extra}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;

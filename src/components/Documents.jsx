import { motion } from "framer-motion";
import { FileText, ArrowSquareOut, CheckCircle } from "@phosphor-icons/react";
import documentsData from "../data/documents.json";

export default function Documents() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const documentsList = Array.isArray(documentsData) 
    ? documentsData 
    : (documentsData.documents || []);

  return (
    <section id="documentos" className="bg-zinc-900 py-24 min-h-[100dvh]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">Documentos & Acreditaciones</h2>
          <div className="h-1 w-20 bg-teal-500 rounded-full"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {documentsList.map((doc, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/50 flex flex-col h-full hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-zinc-950 rounded-xl">
                  <FileText size={24} className="text-teal-500" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100">{doc.title}</h3>
                  <p className="text-zinc-400 text-sm">{doc.institution}</p>
                </div>
              </div>
              <p className="text-zinc-500 text-sm mb-4 flex-1">{doc.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-4 border-t border-zinc-800/50">
                <span className="text-teal-500 text-sm font-mono">{doc.date}</span>
                <div className="flex items-center gap-3">
                  {doc.verifyUrl && (
                    <a
                      href={doc.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-500 hover:text-teal-400 text-sm flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Verificar
                    </a>
                  )}
                  {doc.file && doc.file !== "" ? (
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Ver Documento
                      <ArrowSquareOut size={16} />
                    </a>
                  ) : (
                    <span className="text-zinc-600 text-sm italic">Documento pendiente de subir</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 text-center border-t border-zinc-800 pt-8">
          <p className="text-zinc-500 text-sm">
            Para agregar documentos, consulta el archivo README.md en la carpeta public/documents/
          </p>
        </div>
      </div>
    </section>
  );
}

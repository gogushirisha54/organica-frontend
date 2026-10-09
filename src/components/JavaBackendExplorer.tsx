import React, { useState } from 'react';
import { Copy, Check, FileCode2, Terminal } from 'lucide-react';
import { JAVA_SPRING_BOOT_FILES, JavaSourceFile } from '../data/javaSpringProjectFiles';

export const JavaBackendExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(JAVA_SPRING_BOOT_FILES[1].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeFile: JavaSourceFile =
    JAVA_SPRING_BOOT_FILES.find((f) => f.id === selectedFileId) || JAVA_SPRING_BOOT_FILES[0];

  const handleCopyCode = (file: JavaSourceFile) => {
    navigator.clipboard?.writeText(file.code);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <section
      id="java-spring-code"
      className="py-14 md:py-20 border-t border-[#E4E0D8] bg-[#F2EFE9]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#DFDBD2]">
          <div>
            <div className="text-xs text-[#5A6258] font-medium">
              Full-Stack Java 21 + Spring Boot 3.3 + MySQL Source Package (/java-spring-boot-backend)
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-[#181D18] mt-2 text-balance">
              Java Spring Boot Full-Stack Backend Codebase
            </h2>
            <p className="mt-2 text-sm text-[#3F463E] max-w-2xl leading-relaxed">
              Every login, registration, order placement, UPI payment verification, and 5-stage
              tracking endpoint in this marketplace maps 1:1 to these Spring Boot REST Controllers,
              JPA Entities, and SQL tables included in your project repository.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#1F472B] bg-[#FAF9F5] px-4 py-2.5 rounded-lg border border-[#E4E0D8]">
            <Terminal className="w-4 h-4 shrink-0" />
            <span>mvn spring-boot:run (Port 8080 / 3000)</span>
          </div>
        </div>

        {/* Explorer Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* File Tree Sidebar */}
          <div className="lg:col-span-4 bg-[#FAF9F5] border border-[#E4E0D8] rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-[#5A6258] px-2 pb-2 border-b border-[#E4E0D8]">
              Spring Boot Project Files
            </div>
            {JAVA_SPRING_BOOT_FILES.map((file) => {
              const isSelected = file.id === activeFile.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#1F472B] bg-[#F2EFE9]'
                      : 'border-transparent hover:bg-[#F2EFE9]/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-[#181D18] flex items-center gap-1.5">
                      <FileCode2 className="w-3.5 h-3.5 text-[#1F472B]" />
                      {file.fileName}
                    </span>
                    <span className="text-[11px] text-[#5A6258]">{file.layer}</span>
                  </div>
                  <div className="text-[11px] text-[#5A6258] mt-1 truncate font-mono">
                    {file.packagePath}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-[#181D18] text-[#FAF9F5] rounded-xl border border-[#181D18] overflow-hidden">
            <div className="px-5 py-3.5 bg-[#222822] border-b border-[#333B33] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-xs font-semibold text-[#FAF9F5]">
                  {activeFile.packagePath}
                </div>
                <div className="text-xs text-[#B5BDB3] mt-0.5">{activeFile.description}</div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(activeFile)}
                className="px-3 py-1.5 rounded-lg bg-[#1F472B] hover:bg-[#285B37] text-[#FAF9F5] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedId === activeFile.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied {activeFile.fileName}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Java Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-5 text-xs font-mono leading-relaxed overflow-x-auto max-h-[540px] text-[#E6E8E5]">
              <code>{activeFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

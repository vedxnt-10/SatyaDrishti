import { useState } from 'react';
import { motion } from 'motion/react';
import { UploadSimple, FileImage, ShieldCheck, Warning, Robot } from '@phosphor-icons/react';

const ease = [0.32, 0.72, 0, 1];

export default function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const testVectors = [
    {
      label: 'Genuine ID',
      file: 'genuine_aadhaar.jpg',
      icon: ShieldCheck,
      colorClass: 'text-accent-green border-accent-green/20 bg-accent-green/8',
    },
    {
      label: 'Tampered ID',
      file: 'tampered_aadhaar.jpg',
      icon: Warning,
      colorClass: 'text-accent-red border-accent-red/20 bg-accent-red/8',
    },
    {
      label: 'AI Generated',
      file: 'ai_generated_pan.jpg',
      icon: Robot,
      colorClass: 'text-accent-amber border-accent-amber/20 bg-accent-amber/8',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Upload area */}
      <div
        className={`glass-card cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-accent-primary/30 shadow-[0_0_32px_rgba(16,185,129,0.08)] scale-[1.01]'
            : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            document.getElementById('file-upload').click();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center relative z-10">
          {/* Icon */}
          <div
            className={`mb-6 transition-all duration-400 ${
              isDragging
                ? 'scale-110 text-accent-primary'
                : 'text-text-muted'
            }`}
          >
            <UploadSimple className="h-11 w-11" weight="light" />
          </div>

          <h3 className="text-base font-semibold text-text-primary mb-2">
            Drop your document here
          </h3>
          <p className="text-sm text-text-secondary max-w-xs mb-8">
            or click to browse — supports JPG and PNG
          </p>

          {/* File types */}
          <div className="flex gap-4 text-xs text-text-muted font-medium">
            <span className="flex items-center gap-1.5">
              <FileImage size={14} weight="duotone" /> JPG
            </span>
            <span className="flex items-center gap-1.5">
              <FileImage size={14} weight="duotone" /> PNG
            </span>
          </div>
        </div>

        <input
          id="file-upload"
          type="file"
          accept="image/jpeg, image/png"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Test Vectors */}
      <div className="mt-10">
        <p className="text-xs text-text-muted text-center mb-4 font-medium tracking-wide">
          Test with sample documents
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {testVectors.map((tv) => {
            const Icon = tv.icon;
            return (
              <button
                key={tv.file}
                onClick={() => {
                  fetch(`/sample_docs/${tv.file}`)
                    .then((r) => r.blob())
                    .then((b) =>
                      onUpload(new File([b], tv.file, { type: 'image/jpeg' }))
                    );
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-all duration-300 hover:brightness-125 active:scale-[0.97] ${tv.colorClass}`}
              >
                <Icon size={14} weight="fill" />
                {tv.label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

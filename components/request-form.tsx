"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/components/i18n";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Zap } from "lucide-react";

export default function RequestForm() {
  const { c, lang } = useT();
  const [mounted, setMounted] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectType, setProjectType] = useState("");
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  
  // UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#080a12]" />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = c.request.required;
    if (!email.trim()) {
      newErrors.email = c.request.required;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = lang === "tr" ? "Geçerli bir e-posta adresi girin" : "Enter a valid email address";
    }
    if (!projectType) newErrors.projectType = c.request.required;
    if (!details.trim()) newErrors.details = c.request.required;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Construct pre-filled email mailto url
    const subject = encodeURIComponent(
      lang === "tr" ? `Yeni Hizmet Talebi — ${name}` : `New Service Request — ${name}`
    );
    const body = encodeURIComponent(
      (lang === "tr" ? "Müşteri Bilgileri:\n" : "Client Information:\n") +
      `---------------------------------\n` +
      `${lang === "tr" ? "Ad Soyad / Firma" : "Name / Company"}: ${name}\n` +
      `${lang === "tr" ? "E-posta Adresi" : "Email Address"}: ${email}\n` +
      `${lang === "tr" ? "Telefon Numarası" : "Phone Number"}: ${phone || (lang === "tr" ? "Belirtilmedi" : "Not provided")}\n` +
      `${lang === "tr" ? "Proje Tipi" : "Project Type"}: ${projectType}\n` +
      `${lang === "tr" ? "Tahmini Bütçe" : "Estimated Budget"}: ${budget || (lang === "tr" ? "Belirlenmedi" : "Not specified")}\n\n` +
      `${lang === "tr" ? "Proje Detayları" : "Project Details"}:\n` +
      `---------------------------------\n` +
      `${details}`
    );
    
    // Open default mail client
    const recipientEmail = atob("c2FtZXRndWxlcjgxQHlhaG9vLmNvbS50cg==");
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    // Display success screen
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080a12] text-[#edeff8] relative py-16 px-4 md:px-8 flex flex-col justify-between overflow-x-hidden">
      {/* Background radial glow */}
      <div 
        className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.08), transparent 60%)",
          filter: "blur(50px)"
        }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle, rgba(139, 147, 255, 0.05), transparent 60%)",
          filter: "blur(50px)"
        }}
      />

      <div className="max-w-2xl w-full mx-auto z-10 flex-grow flex flex-col justify-center">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#969bb0] hover:text-[#8b93ff] transition-colors group">
            <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
            {c.request.back}
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="request-card"
            >
              <div className="mb-8">
                <span className="eyebrow m-0 text-xs text-[#8b93ff] font-mono tracking-widest uppercase">
                  {lang === "tr" ? "HİZMET TALEBİ" : "SERVICE REQUEST"}
                </span>
                <h1 className="serif text-3xl font-bold mt-3 mb-2 text-white tracking-tight">
                  {c.request.title}
                </h1>
                <p className="text-sm text-[#969bb0] font-sans">
                  {c.request.subtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                    {c.request.name} <span className="text-[#8b93ff]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`form-input w-full bg-[#141826]/40 border ${errors.name ? "border-red-500/50" : "border-[#edeff8]/10"} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors`}
                    placeholder={lang === "tr" ? "Örn. Ahmet Yılmaz / ABC A.Ş." : "e.g. John Doe / ABC Inc."}
                  />
                  {errors.name && (
                    <span className="text-red-500/80 text-xs mt-1 block font-sans">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Grid for Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                      {c.request.email} <span className="text-[#8b93ff]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`form-input w-full bg-[#141826]/40 border ${errors.email ? "border-red-500/50" : "border-[#edeff8]/10"} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors`}
                      placeholder="hello@example.com"
                    />
                    {errors.email && (
                      <span className="text-red-500/80 text-xs mt-1 block font-sans">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                      {c.request.phone}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors"
                      placeholder="+90 555 555 55 55"
                    />
                  </div>
                </div>

                {/* Grid for Project Type & Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Type */}
                  <div>
                    <label htmlFor="projectType" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                      {c.request.projectType} <span className="text-[#8b93ff]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="projectType"
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className={`form-select w-full bg-[#141826]/40 border ${errors.projectType ? "border-red-500/50" : "border-[#edeff8]/10"} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] appearance-none cursor-pointer transition-colors`}
                      >
                        <option value="" disabled className="bg-[#0d1019] text-[#565b72]">
                          {lang === "tr" ? "Seçiniz..." : "Select type..."}
                        </option>
                        {c.request.projectTypes.map((type, idx) => (
                          <option key={idx} value={type} className="bg-[#0d1019] text-[#edeff8]">
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#969bb0]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.projectType && (
                      <span className="text-red-500/80 text-xs mt-1 block font-sans">
                        {errors.projectType}
                      </span>
                    )}
                  </div>

                  {/* Budget */}
                  <div>
                    <label htmlFor="budget" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                      {c.request.budget}
                    </label>
                    <div className="relative">
                      <select
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="form-select w-full bg-[#141826]/40 border border-[#edeff8]/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] appearance-none cursor-pointer transition-colors"
                      >
                        {c.request.budgets.map((b, idx) => (
                          <option key={idx} value={idx === 0 ? "" : b} className="bg-[#0d1019] text-[#edeff8]" disabled={idx === 0}>
                            {b}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#969bb0]">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <label htmlFor="details" className="block text-sm font-sans font-medium text-[#edeff8]/80 mb-2">
                    {c.request.details} <span className="text-[#8b93ff]">*</span>
                  </label>
                  <textarea
                    id="details"
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className={`form-input w-full bg-[#141826]/40 border ${errors.details ? "border-red-500/50" : "border-[#edeff8]/10"} rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#8b93ff] transition-colors resize-y`}
                    placeholder={lang === "tr" ? "Projenin hedefleri, gereksinimleri ve detaylarından kısaca bahsedin..." : "Briefly explain the project goals, features and requirements..."}
                  />
                  {errors.details && (
                    <span className="text-red-500/80 text-xs mt-1 block font-sans">
                      {errors.details}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-request relative overflow-hidden"
                  style={{ display: "flex", gap: 8, minHeight: "46px" }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {c.request.submitting}
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="fill-current" />
                      {c.request.submit}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="request-card request-card-success text-center flex flex-col items-center"
            >
              <div className="text-[#8b93ff] mb-6">
                <CheckCircle size={64} className="stroke-[1.5]" />
              </div>
              <h2 className="serif text-3xl font-bold text-white mb-3">
                {c.request.successTitle}
              </h2>
              <p className="text-sm text-[#969bb0] max-w-md mb-8 leading-relaxed">
                {c.request.successDesc}
              </p>
              <Link href="/" className="btn-request">
                {c.request.back}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="footer z-10 mt-12 pt-8 text-center text-xs text-[#565b72] font-mono border-t border-[#edeff8]/5">
        {c.footer.left}
      </footer>
    </div>
  );
}

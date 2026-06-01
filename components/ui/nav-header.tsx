"use client"; 

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useT } from "@/components/i18n";
import { usePathname } from "next/navigation";

export function NavHeader({ activeSection }: { activeSection: string }) {
  const { c } = useT();
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");

  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const ulRef = useRef<HTMLUListElement>(null);

  const updatePositionToElement = (el: HTMLElement) => {
    setPosition({
      width: el.offsetWidth,
      opacity: 1,
      left: el.offsetLeft,
    });
  };

  const updatePositionToActive = () => {
    if (!ulRef.current) return;
    
    if (isBlog) {
      const blogLink = ulRef.current.querySelector(`a[href="/blog"]`);
      const blogLi = blogLink?.closest("li");
      if (blogLi) {
        updatePositionToElement(blogLi);
        return;
      }
    }

    if (!activeSection) {
      setPosition((pv) => ({ ...pv, opacity: 0 }));
      return;
    }
    
    const activeLink = ulRef.current.querySelector(`a[href="/#${activeSection}"]`);
    const activeLi = activeLink?.closest("li");
    if (activeLi) {
      updatePositionToElement(activeLi);
    } else {
      setPosition((pv) => ({ ...pv, opacity: 0 }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(updatePositionToActive, 100);
    window.addEventListener("resize", updatePositionToActive);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePositionToActive);
    };
  }, [activeSection, pathname]);

  return (
    <ul
      ref={ulRef}
      className="relative mx-auto flex w-fit rounded-full border border-white/15 bg-white/10 backdrop-blur-lg p-1"
      onMouseLeave={updatePositionToActive}
      style={{ listStyle: "none" }}
    >
      <Tab onHover={updatePositionToElement} href="/#about" isActive={activeSection === "about" && !isBlog}>
        {c.nav.about}
      </Tab>
      <Tab onHover={updatePositionToElement} href="/#skills" isActive={activeSection === "skills" && !isBlog}>
        {c.nav.skills}
      </Tab>
      <Tab onHover={updatePositionToElement} href="/#work" isActive={activeSection === "work" && !isBlog}>
        {c.nav.work}
      </Tab>
      <Tab onHover={updatePositionToElement} href="/#experience" isActive={activeSection === "experience" && !isBlog}>
        {c.nav.experience}
      </Tab>
      <Tab onHover={updatePositionToElement} href="/#contact" isActive={activeSection === "contact" && !isBlog}>
        {c.nav.contact}
      </Tab>
      <Tab onHover={updatePositionToElement} href="/blog" isActive={isBlog}>
        {c.nav.blog}
      </Tab>

      <Cursor position={position} />
    </ul>
  );
}

const Tab = ({
  children,
  onHover,
  href,
  isActive,
}: {
  children: React.ReactNode;
  onHover: (el: HTMLElement) => void;
  href: string;
  isActive: boolean;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) {
          onHover(ref.current);
        }
      }}
      className={`relative z-10 block cursor-pointer px-4 py-2 text-xs uppercase font-mono tracking-wider transition-colors duration-300 md:px-6 md:py-2.5 ${
        isActive ? "text-white font-medium" : "text-white/70 hover:text-white"
      }`}
    >
      <a href={href} className="block w-full h-full">
        {children}
      </a>
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-6 rounded-full bg-[#8b93ff]/20 border border-[#8b93ff]/30 shadow-[0_0_12px_rgba(139,147,255,0.15)] md:h-8"
      style={{ top: "4px" }}
    />
  );
};

export default NavHeader;

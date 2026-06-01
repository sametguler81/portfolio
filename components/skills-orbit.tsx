"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Link as LinkIcon,
  Zap,
  Server,
  Atom,
  Smartphone,
  Braces,
  Apple,
  Layers,
  Database,
  GitBranch,
  Cpu,
} from "lucide-react";
import { useT } from "@/components/i18n";

interface SkillNode {
  id: number;
  title: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "expert" | "proficient" | "learning";
  energy: number; // 0-100 proficiency
}

// Order must match c.skills.items in i18n
const skills: SkillNode[] = [
  { id: 1, title: "Node.js", icon: Server, relatedIds: [2, 7, 8], status: "expert", energy: 92 },
  { id: 2, title: "React", icon: Atom, relatedIds: [1, 3], status: "proficient", energy: 85 },
  { id: 3, title: "Flutter", icon: Smartphone, relatedIds: [4, 5, 6], status: "expert", energy: 92 },
  { id: 4, title: "Dart", icon: Braces, relatedIds: [3], status: "proficient", energy: 88 },
  { id: 5, title: "Swift", icon: Apple, relatedIds: [3], status: "proficient", energy: 75 },
  { id: 6, title: "Kotlin", icon: Layers, relatedIds: [3], status: "proficient", energy: 75 },
  { id: 7, title: "PostgreSQL", icon: Database, relatedIds: [1, 8], status: "proficient", energy: 85 },
  { id: 8, title: "DevOps", icon: GitBranch, relatedIds: [1, 7, 9], status: "proficient", energy: 78 },
  { id: 9, title: "IoT", icon: Cpu, relatedIds: [8], status: "learning", energy: 65 },
];

const statusLabel: Record<"en" | "tr", Record<SkillNode["status"], string>> = {
  en: { expert: "EXPERT", proficient: "PROFICIENT", learning: "GROWING" },
  tr: { expert: "UZMAN", proficient: "YETKİN", learning: "GELİŞEN" },
};

export default function SkillsOrbit() {
  const { c, lang } = useT();
  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [radius, setRadius] = useState(200);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w < 480) {
        setRadius(120);
      } else if (w < 768) {
        setRadius(150);
      } else {
        setRadius(200);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) newState[parseInt(key)] = false;
      });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const related = getRelatedItems(id);
        const np: Record<number, boolean> = {};
        related.forEach((r) => (np[r] = true));
        setPulseEffect(np);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }
      return newState;
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (autoRotate) {
      timer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
      }, 50);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;
    const nodeIndex = skills.findIndex((i) => i.id === nodeId);
    const targetAngle = (nodeIndex / skills.length) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radiusVal = radius;
    const radian = (angle * Math.PI) / 180;
    const x = radiusVal * Math.cos(radian);
    const y = radiusVal * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const item = skills.find((i) => i.id === itemId);
    return item ? item.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  return (
    <div className="orbit" ref={containerRef} onClick={handleContainerClick}>
      <div className="orbit-field">
        <div className="orbit-inner" ref={orbitRef}>
          {/* core */}
          <div className="orbit-core">
            <div className="orbit-core-ping" />
            <div className="orbit-core-ping orbit-core-ping--2" />
            <div className="orbit-core-dot" />
          </div>
          <div className="orbit-ring" style={{ width: radius * 2, height: radius * 2 }} />

          {mounted && skills.map((item, index) => {
            const pos = calculateNodePosition(index, skills.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;
            const t = c.skills.items[index];

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="orbit-node"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  zIndex: isExpanded ? 200 : pos.zIndex,
                  opacity: isExpanded ? 1 : pos.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`orbit-glow ${isPulsing ? "is-pulsing" : ""}`}
                  style={{
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5) / 2}px`,
                    top: `-${(item.energy * 0.5) / 2}px`,
                  }}
                />
                <div
                  className={`orbit-dot ${isExpanded ? "is-expanded" : ""} ${
                    isRelated ? "is-related" : ""
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className={`orbit-label mono ${isExpanded ? "is-expanded" : ""}`}>
                  {item.title}
                </div>

                {isExpanded && !isMobile && (
                  <div className="orbit-card">
                    <div className="orbit-card-stem" />
                    <div className="orbit-card-head">
                      <span className={`orbit-badge orbit-badge--${item.status}`}>
                        {statusLabel[lang][item.status]}
                      </span>
                      <span className="orbit-card-cat mono">{t.category}</span>
                    </div>
                    <h4 className="orbit-card-title serif">{item.title}</h4>
                    <p className="orbit-card-body">{t.content}</p>

                    <div className="orbit-card-section">
                      <div className="orbit-card-row mono">
                        <span>
                          <Zap size={10} /> {lang === "tr" ? "Yeterlilik" : "Proficiency"}
                        </span>
                        <span>{item.energy}%</span>
                      </div>
                      <div className="orbit-meter">
                        <div className="orbit-meter-fill" style={{ width: `${item.energy}%` }} />
                      </div>
                    </div>

                    {item.relatedIds.length > 0 && (
                      <div className="orbit-card-section">
                        <div className="orbit-card-connected mono">
                          <LinkIcon size={10} /> {lang === "tr" ? "Şununla uyumlu" : "Pairs with"}
                        </div>
                        <div className="orbit-chips">
                          {item.relatedIds.map((rid) => {
                            const r = skills.find((i) => i.id === rid);
                            return (
                              <button
                                key={rid}
                                className="orbit-chip mono"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(rid);
                                }}
                              >
                                {r?.title}
                                <ArrowRight size={9} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Modal Overlay */}
      {isMobile && activeNodeId !== null && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => {
            setExpandedItems({});
            setActiveNodeId(null);
            setPulseEffect({});
            setAutoRotate(true);
          }}
        >
          {(() => {
            const activeNode = skills.find(s => s.id === activeNodeId);
            if (!activeNode) return null;
            const index = skills.findIndex(s => s.id === activeNodeId);
            const t = c.skills.items[index];
            const Icon = activeNode.icon;

            return (
              <div 
                className="orbit-card relative" 
                style={{ 
                  position: "relative", 
                  top: "auto", 
                  left: "auto", 
                  transform: "none", 
                  animation: "orbitCardIn 0.35s var(--ease)",
                  width: "100%",
                  maxWidth: "300px"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setExpandedItems({});
                    setActiveNodeId(null);
                    setPulseEffect({});
                    setAutoRotate(true);
                  }}
                  aria-label="Close details"
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--ink-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px"
                  }}
                >
                  <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="orbit-card-head">
                  <span className={`orbit-badge orbit-badge--${activeNode.status}`}>
                    {statusLabel[lang][activeNode.status]}
                  </span>
                  <span className="orbit-card-cat mono">{t.category}</span>
                </div>
                <h4 className="orbit-card-title serif">{activeNode.title}</h4>
                <p className="orbit-card-body">{t.content}</p>

                <div className="orbit-card-section">
                  <div className="orbit-card-row mono">
                    <span>
                      <Zap size={10} /> {lang === "tr" ? "Yeterlilik" : "Proficiency"}
                    </span>
                    <span>{activeNode.energy}%</span>
                  </div>
                  <div className="orbit-meter">
                    <div className="orbit-meter-fill" style={{ width: `${activeNode.energy}%` }} />
                  </div>
                </div>

                {activeNode.relatedIds.length > 0 && (
                  <div className="orbit-card-section">
                    <div className="orbit-card-connected mono">
                      <LinkIcon size={10} /> {lang === "tr" ? "Şununla uyumlu" : "Pairs with"}
                    </div>
                    <div className="orbit-chips">
                      {activeNode.relatedIds.map((rid) => {
                        const r = skills.find((i) => i.id === rid);
                        return (
                          <button
                            key={rid}
                            className="orbit-chip mono"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(rid);
                            }}
                          >
                            {r?.title}
                            <ArrowRight size={9} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

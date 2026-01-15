import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { UserRound } from "lucide-react";

export type PillNavItem = { label: string; href: string; ariaLabel?: string; onClick?: () => void };

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  enterDuration?: number;
  leaveDuration?: number;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onProfileClick?: () => void;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  activeHref,
  className = "",
  ease = "power3.out",
  enterDuration = 0.7,
  leaveDuration = 0.6,
  baseColor = "#0B1B34",
  pillColor = "#F4F1E8",
  hoveredPillTextColor = "#ffffff",
  pillTextColor,
  onProfileClick,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;
        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${originY}px` });
        const label = pill.querySelector<HTMLElement>(".pill-label");
        const white = pill.querySelector<HTMLElement>(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });
        const i = circleRefs.current.indexOf(circle);
        if (i === -1) return;
        tlRefs.current[i]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.5, xPercent: -50, duration: 3, ease, overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 3, ease, overwrite: "auto" }, 0);
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 3, ease, overwrite: "auto" }, 0);
        }
        tlRefs.current[i] = tl;
      });
    };
    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    (document as any).fonts?.ready.then(layout).catch(() => { });
    return () => window.removeEventListener("resize", onResize);
  }, [items, ease]);
  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: enterDuration, ease, overwrite: "auto" });
  };
  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, { duration: leaveDuration, ease, overwrite: "auto" });
  };
  const isExternal = (href: string) =>
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");
  const isRouterLink = (href?: string) => href && !isExternal(href);
  const cssVars = {
    ["--base"]: baseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
    ["--nav-h"]: "60px",
    ["--pill-pad-x"]: "40px",
    ["--pill-gap"]: "8px",
  } as React.CSSProperties;
  return (
    <>
      <div className="fixed top-8 left-6 z-[1000]" style={cssVars}>
        <button
          aria-label="User"
          onClick={onProfileClick}
          className="h-[var(--nav-h)] w-[var(--nav-h)] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          style={{ background: "var(--base)" }}
        >
          <UserRound size={22} color={pillColor} />
        </button>
      </div>
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[1000] ${className || ""}`} style={cssVars}>
        <nav aria-label="Primary" className="relative">
          <div className="flex items-center rounded-full" style={{ height: "var(--nav-h)", background: "var(--base)" }}>
            <span
              className="ml-2 mr-1 inline-flex items-center justify-center overflow-hidden rounded-full"
              style={{ width: "calc(var(--nav-h) - 12px)", height: "calc(var(--nav-h) - 12px)", background: "#F4F1E8" }}
            >
              <img src={logo} alt={logoAlt} className="h-full w-full object-contain p-2" />
            </span>
            <ul role="menubar" className="list-none flex items-stretch m-0 p-[4px] h-full" style={{ gap: "var(--pill-gap)" }}>
              {items.map((item, i) => {
                const isActive = activeHref === item.href;
                const pillStyle: React.CSSProperties = {
                  background: "var(--pill-bg)",
                  color: "var(--pill-text)",
                  paddingLeft: "var(--pill-pad-x)",
                  paddingRight: "var(--pill-pad-x)",
                };
                const PillContent = (
                  <>
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{ background: "var(--base)", willChange: "transform" }}
                      aria-hidden="true"
                      ref={(el) => { circleRefs.current[i] = el; }}
                    />
                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span className="pill-label relative z-[2] inline-block leading-[1]">{item.label}</span>
                      <span className="pill-label-hover absolute left-0 top-0 z-[3] inline-block" style={{ color: "var(--hover-text)" }} aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                    {isActive && (
                      <span
                        className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                        style={{ background: "var(--base)" }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                );
                const basePillClasses =
                  "relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[16px] leading-none uppercase tracking-[0.2px] whitespace-nowrap px-0";
                return (
                  <li key={item.href} role="none" className="flex h-full">
                    {isRouterLink(item.href) ? (
                      <Link
                        role="menuitem"
                        to={item.href}
                        className={basePillClasses}
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                        onClick={item.onClick}
                      >
                        {PillContent}
                      </Link>
                    ) : (
                      <a
                        role="menuitem"
                        href={item.href}
                        className={basePillClasses}
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                        onClick={item.onClick}
                      >
                        {PillContent}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
};

export default PillNav;
import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function LogoMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 38 38" role="img" aria-label="TrustTrace">
      <path d="M19 2.5 33 8v10.3c0 8.3-5.5 14.7-14 17.2C10.5 33 5 26.6 5 18.3V8l14-5.5Z" fill="currentColor" />
      <path d="M10.5 19h4l2.2-5.2 4.1 10.6 2.7-6.1h4" fill="none" stroke="#07120f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OverviewIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
}

export function TraceIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M4 7h4l2.2 4 3.3-7 2.2 12 2.1-5H21" /><path d="M4 20h16" /></svg>;
}

export function ReviewIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
}

export function EvaluationIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M4 19V9" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19V3" /><path d="M2 19h22" /></svg>;
}

export function SettingsIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.09A1.7 1.7 0 0 0 8.5 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3V9.6h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.25.34.46.69.6 1 .13.34.17.71.1 1.1h.9v4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></svg>;
}

export function DocsIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h6" /></svg>;
}

export function SearchIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>;
}

export function ExternalIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
}

export function MenuIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
}

export function CloseIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

export function AlertIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>;
}

export function ShieldIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function ClockIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
}

export function CoinIcon(props: IconProps) {
  return <svg {...shared} {...props}><circle cx="12" cy="12" r="9" /><path d="M16 8.5c-.7-.7-1.8-1-3.1-1-1.7 0-2.9.8-2.9 2s1 1.8 3 2.2c2 .4 3 1 3 2.4 0 1.3-1.2 2.3-3 2.4-1.5.1-2.8-.4-3.6-1.2M12.8 5v14" /></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m5 12 4 4L19 6" /></svg>;
}

export function CopyIcon(props: IconProps) {
  return <svg {...shared} {...props}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></svg>;
}

export function ChevronIcon(props: IconProps) {
  return <svg {...shared} {...props}><path d="m9 18 6-6-6-6" /></svg>;
}

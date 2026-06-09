import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const IconArrowRight = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const IconChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconChevronUp = (p: P) => (
  <Svg {...p}>
    <path d="m6 15 6-6 6 6" />
  </Svg>
);

export const IconMapPin = (p: P) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
);

export const IconHeart = (p: P) => (
  <Svg {...p}>
    <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7Z" />
  </Svg>
);

export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconEdit = (p: P) => (
  <Svg {...p}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Svg>
);

export const IconTrash = (p: P) => (
  <Svg {...p}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
  </Svg>
);

export const IconBolt = (p: P) => (
  <Svg {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </Svg>
);

export const IconChat = (p: P) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12Z" />
    <path d="M8 11h.01M12 11h.01M16 11h.01" />
  </Svg>
);

export const IconSend = (p: P) => (
  <Svg {...p}>
    <path d="m5 12 14-7-7 14-2-5-5-2Z" />
  </Svg>
);

export const IconShieldCheck = (p: P) => (
  <Svg {...p}>
    <path d="M12 2 4 6v6c0 5 8 10 8 10s8-5 8-10V6Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const IconShield = (p: P) => (
  <Svg {...p}>
    <path d="M12 2 4 6v6c0 5 8 10 8 10s8-5 8-10V6Z" />
  </Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const IconX = (p: P) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconMail = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);

export const IconPhone = (p: P) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7A2 2 0 0 1 22 16.9Z" />
  </Svg>
);

export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);

export const IconSettings = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11 4.6V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Svg>
);

export const IconLogout = (p: P) => (
  <Svg {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export const IconHistory = (p: P) => (
  <Svg {...p}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </Svg>
);

export const IconCalendar = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </Svg>
);

export const IconBot = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="11" rx="3" />
    <path d="M12 8V4M9 13h.01M15 13h.01" />
  </Svg>
);

export const IconWifi = (p: P) => (
  <Svg {...p}>
    <path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01" />
  </Svg>
);

export const IconHome = (p: P) => (
  <Svg {...p}>
    <path d="M3 11l9-8 9 8M5 9v11h14V9" />
  </Svg>
);

export const IconBuilding = (p: P) => (
  <Svg {...p}>
    <path d="M3 11l9-8 9 8M5 9v11h14V9M10 20v-6h4v6" />
  </Svg>
);

export const IconUsers = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0M16 7a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" />
  </Svg>
);

export const IconWarning = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 2 20h20L12 3ZM12 10v4M12 17h.01" />
  </Svg>
);

export const IconTrendUp = (p: P) => (
  <Svg {...p}>
    <path d="m4 17 6-6 4 4 6-7" />
  </Svg>
);

export const IconBed = (p: P) => (
  <Svg {...p}>
    <path d="M3 18v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6M3 14h18M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
  </Svg>
);

export const IconRuler = (p: P) => (
  <Svg {...p}>
    <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
  </Svg>
);

export const IconSnow = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconBath = (p: P) => (
  <Svg {...p}>
    <path d="M4 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" />
  </Svg>
);

export const IconLock = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

export const IconEye = (p: P) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconEyeOff = (p: P) => (
  <Svg {...p}>
    <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4.2M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4-.8M3 3l18 18M9.5 9.5a3 3 0 0 0 4.2 4.2" />
  </Svg>
);

export const IconUpload = (p: P) => (
  <Svg {...p}>
    <path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </Svg>
);

// Smart TV
export const IconTv = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="6" width="20" height="13" rx="2" />
    <path d="m8 22 4-3 4 3" />
  </Svg>
);

// Water Heater / Shower
export const IconShower = (p: P) => (
  <Svg {...p}>
    <path d="M4 14V6a3 3 0 0 1 6 0M10 6h10M14 14h.01M11 17h.01M17 17h.01M14 20h.01M11 11h.01M17 11h.01" />
  </Svg>
);

// Laundry / Washing Machine
export const IconWashing = (p: P) => (
  <Svg {...p}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M6 5h.01M10 5h.01" />
    <circle cx="12" cy="14" r="4.5" />
  </Svg>
);

// Dapur Bersama / Chef Hat
export const IconChefHat = (p: P) => (
  <Svg {...p}>
    <path d="M6 14a4 4 0 1 1 1-7.9 4.5 4.5 0 0 1 8.9 0A4 4 0 1 1 18 14M6 14v5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-5M6 17h12" />
  </Svg>
);

// CCTV / Camera
export const IconCamera = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="7" width="14" height="10" rx="2" />
    <path d="m16 10 6-3v10l-6-3" />
  </Svg>
);

// Tools / Perawatan
export const IconWrench = (p: P) => (
  <Svg {...p}>
    <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z" />
  </Svg>
);

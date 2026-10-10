import type { ReactNode } from "react";
import {
  ArrowUpRight,
  CircleCheck,
  Coins,
  PackageCheck,
  ShieldCheck,
  Truck,
  UserRound,
  Wallet,
  Route,
  Info,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import styles from "./courier.module.css";

const icons = {
  truck: Truck,
  wallet: Wallet,
  parcels: PackageCheck,
  profile: UserRound,
  shield: ShieldCheck,
  cash: Coins,
  route: Route,
  check: CircleCheck,
};
type IconName = keyof typeof icons;

export function CourierPageHeader({
  title,
  description,
  eyebrow,
  icon,
  action,
}: {
  title: string;
  description: string;
  eyebrow: string;
  icon: IconName;
  action?: ReactNode;
}) {
  const Icon = icons[icon];
  return (
    <header className={styles.header} data-courier-header>
      <div>
        <span className={styles.eyebrow}>
          <Icon aria-hidden="true" />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </header>
  );
}

export function CourierMetric({
  label,
  value,
  detail,
  icon,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon: IconName;
  accent?: boolean;
}) {
  const Icon = icons[icon];
  return (
    <article
      className={`${styles.metric} ${accent ? styles.accent : ""}`}
      data-courier-metric
    >
      <div className={styles.metricTop}>
        <h2>{label}</h2>
        <span className={styles.icon}>
          <Icon aria-hidden="true" />
        </span>
      </div>
      <p
        className={styles.value}
        data-long={typeof value === "string" && value.length > 20}
        data-currency={typeof value === "string" && /৳|BDT/.test(value)}
      >
        {value}
      </p>
      {detail && <p className={styles.detail}>{detail}</p>}
    </article>
  );
}

export function CourierNote({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.note}>
      <Info aria-hidden="true" />
      <div>{children}</div>
    </aside>
  );
}

export function CourierQuickLinks({ bn }: { bn: boolean }) {
  const links = [
    {
      href: "/courier/deliveries",
      icon: "truck" as const,
      title: "My Deliveries",
      bangla: "আমার ডেলিভারি",
      detail: bn
        ? "সংগ্রহ, হাবে হস্তান্তর ও ডেলিভারির বরাদ্দ করা কাজ দেখুন।"
        : "Find assigned pickups, hub handovers and delivery tasks.",
    },
    {
      href: "/courier/collections",
      icon: "cash" as const,
      title: "Cash Collections",
      bangla: "নগদ সংগ্রহ",
      detail: bn
        ? "পণ্যের সংগৃহীত নগদ টাকা ও হস্তান্তরের হিসাব মিলিয়ে নিন।"
        : "Review collected product cash and recorded handovers.",
    },
    {
      href: "/courier/profile",
      icon: "profile" as const,
      title: "Profile",
      bangla: "প্রোফাইল",
      detail: bn
        ? "নিজের যোগাযোগের তথ্য সঠিক ও হালনাগাদ রাখুন।"
        : "Keep your personal and contact details up to date.",
    },
  ];
  return (
    <nav
      className={styles.shortcuts}
      aria-label={bn ? "কুরিয়ারের প্রয়োজনীয় কাজ" : "Courier quick actions"}
    >
      {links.map((item) => {
        const Icon = icons[item.icon];
        return (
          <Link key={item.href} href={item.href} className={styles.shortcut}>
            <span className={styles.icon}>
              <Icon aria-hidden="true" />
            </span>
            <div>
              <h2>{bn ? item.bangla : item.title}</h2>
              <p className={styles.detail}>{item.detail}</p>
            </div>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}

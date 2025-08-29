"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import CustomBreadcrumb from "./custom-breadcrumb";

export type BreadcrumbItemType = { label: string; href?: string };
type BreadcrumbContextType = {
  extras: BreadcrumbItemType[];
  setExtras: (items: BreadcrumbItemType[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | null>(null);

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx)
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  return ctx;
}

export function BreadcrumbProvider({ children }: PropsWithChildren) {
  const [extras, setExtras] = useState<BreadcrumbItemType[]>([]);
  return (
    <BreadcrumbContext.Provider value={{ extras, setExtras }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function LayoutShell() {
  const { extras } = useBreadcrumb();
  return <CustomBreadcrumb extras={extras} />;
}

type SetBreadcrumbProps = {
  label: string;
  href?: string;
};

export function SetBreadcrumb({ label, href }: SetBreadcrumbProps) {
  const { setExtras } = useBreadcrumb();

  useEffect(() => {
    setExtras([{ label, href }]);
  }, [label, href, setExtras]);
  return null;
}

"use client";

import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { BreadcrumbItemType } from "./breadcrumb-context";
import { usePathname } from "next/navigation";

type CustomBreadcrumbProps = {
  extras: BreadcrumbItemType[];
};

export default function CustomBreadcrumb({ extras }: CustomBreadcrumbProps) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {extras.map((item, index) => (
          <Fragment key={item.label || index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbLink asChild>
                  <span>{item.label}</span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

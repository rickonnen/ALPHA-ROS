"use client";
import { Fragment } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
interface BreadCrumbItemData {
  label: string;
  href?: string;
}
interface BreadcrumbSeguridadProps {
  items: BreadCrumbItemData[];
}

export default function BreadCrumbSeguridad({
  items,
}: BreadcrumbSeguridadProps) {
  return (
    <Breadcrumb className="font-sans">
      <BreadcrumbList className="font-sans text-[12px] font-semibold uppercase tracking-[0.02em] text-white/70">
        <BreadcrumbItem>
          <BreadcrumbLink
            asChild
            className="text-white/75 hover:text-white transition-colors"
          >
            <Link href="/frontend/perfil?view=seguridad">SEGURIDAD</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink
                  asChild
                  className="text-white/75 hover:text-white transition-colors"
                >
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-white">
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {index < items.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

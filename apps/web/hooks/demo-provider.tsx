"use client";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { WebsiteData } from "@findbuddy/types";
type DemoState = {
  data: WebsiteData;
  setData: Dispatch<SetStateAction<WebsiteData>>;
  adminId: string | null;
  setAdminId: Dispatch<SetStateAction<string | null>>;
};
const DemoContext = createContext<DemoState | null>(null);
// All mutations are isolated in memory. A reload restores the single JSON source.
export function DemoProvider({
  initialData,
  children,
}: {
  initialData: WebsiteData;
  children: ReactNode;
}) {
  const [data, setData] = useState(initialData);
  const [adminId, setAdminId] = useState<string | null>(null);
  return (
    <DemoContext.Provider value={{ data, setData, adminId, setAdminId }}>
      {children}
    </DemoContext.Provider>
  );
}
export function useDemo(): DemoState {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}

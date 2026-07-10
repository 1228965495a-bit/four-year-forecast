import { createFileRoute } from "@tanstack/react-router";
import { MajorBrowser } from "./major";

export const Route = createFileRoute("/catalog")({ component: CatalogPage });

function CatalogPage() {
  return <MajorBrowser mode="catalog" />;
}

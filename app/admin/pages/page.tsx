import { getPages } from "@/actions/app_pages";
import { getSectionConfigs } from "@/actions/sections";
import { SECTIONS } from "@/constants/sections";
import PagesClient from "./_components/pages-client";

export default async function PagesIndex() {
  const [pages, sectionConfigs] = await Promise.all([
    getPages(),
    getSectionConfigs(SECTIONS.map((s) => s.key)),
  ]);

  return <PagesClient initialPages={pages} initialConfigs={sectionConfigs} />;
}

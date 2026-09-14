import { SITE_CONFIG } from "@/lib/config";
import { YohakuExperience } from "@/components/yohaku-experience";

export default function Home() {
  return <YohakuExperience config={SITE_CONFIG} />;
}

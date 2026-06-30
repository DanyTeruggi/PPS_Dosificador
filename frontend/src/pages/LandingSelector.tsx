import { useIsDesktop } from "../hooks/useIsDesktop";
import HomePageDesktop from "../pages/HomePageDesktop";
import HomePageMobile from "../pages/HomePageMobil";

export default function LandingSelector() {
  const isDesktop = useIsDesktop();

  return isDesktop ? <HomePageDesktop /> : <HomePageMobile />;
}

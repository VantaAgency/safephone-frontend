import HomePage from "@/components/pages/HomePage";

// The root `/` redirects through proxy.ts to /sn or /us based on market
// detection, so this page is rarely served directly. We keep it as a
// graceful fallback rendering the same HomePage body.
export default HomePage;

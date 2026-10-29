import { useNavigate } from "react-router-dom";
import type { Screen } from "../types";
import { screenPath } from "../router/paths";

/**
 * Thin adapter so every customer page can keep calling `go({ name: "cart" })`
 * exactly like before, while the actual navigation now goes through
 * react-router (real URLs, working back/forward, refreshable deep links).
 */
export function useGo() {
  const navigate = useNavigate();
  return (screen: Screen) => navigate(screenPath(screen));
}

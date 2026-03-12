import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import SplashScreen from "./components/SplashScreen";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import HomePage from "./pages/HomePage";
import NotationViewerPage from "./pages/NotationViewerPage";
import PairingPage from "./pages/PairingPage";
import ProfilePage from "./pages/ProfilePage";

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const communitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communities",
  component: CommunitiesPage,
});

const communityDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communities/$communityId",
  component: CommunityDetailPage,
});

const notationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notation",
  component: NotationViewerPage,
});

const pairingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pairing",
  component: PairingPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  communitiesRoute,
  communityDetailRoute,
  notationRoute,
  pairingRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!showSplash) {
      const t = setTimeout(() => setSplashDone(true), 10);
      return () => clearTimeout(t);
    }
  }, [showSplash]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}
      </AnimatePresence>
      {(!showSplash || splashDone) && <RouterProvider router={router} />}
    </>
  );
}

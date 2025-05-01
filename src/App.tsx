
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Threads from "./pages/Threads";
import ThreadView from "./pages/ThreadView";
import Connections from "./pages/Connections";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Preferences from "./pages/Preferences";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <main className="min-h-[calc(100vh-73px)]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/threads" element={<Threads />} />
                <Route path="/threads/:threadId" element={<ThreadView />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

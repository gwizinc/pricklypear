import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "./components/Navigation";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Threads from "./pages/Threads";
import ThreadView from "./pages/ThreadView";
import Connections from "./pages/Connections";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import Preferences from "./pages/Preferences";
import Documents from "./pages/Documents";

// Import CSS but don't include App.css anymore
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/threads" element={<Threads />} />
                  <Route path="/threads/:threadId" element={<ThreadView />} />
                  <Route path="/connections" element={<Connections />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

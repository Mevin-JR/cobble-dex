import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dex from "./pages/dex.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthContext.tsx";
import { MarkedPokemonProvider } from "./context/MarkedPokemonContext.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <MarkedPokemonProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/dex" element={<Dex />} />
                    </Routes>
                </BrowserRouter>
            </MarkedPokemonProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>,
);

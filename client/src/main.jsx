import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Toaster} from "react-hot-toast";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import './index.css';
import {AuthProvider} from './context/AuthContext';
import {SaldosProvider} from "./context/SaldosContext";

const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 1000 * 60 * 5, // 5 minutos de caché
            },
        },
    }
);


ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <AuthProvider>
            <SaldosProvider>
                <QueryClientProvider client={queryClient}>
                    <App/>
                </QueryClientProvider>
            </SaldosProvider>
        </AuthProvider>
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
    </>
);
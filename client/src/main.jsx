import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Toaster} from "react-hot-toast";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import './index.css';
import {AuthProvider} from './context/AuthContext';

const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
            },
        },
    }
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <App/>
            </QueryClientProvider>
        </AuthProvider>
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
    </>
);
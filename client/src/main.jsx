import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Toaster} from "react-hot-toast";
import './index.css';
import {AuthProvider} from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <>
        <AuthProvider>
            <App/>
        </AuthProvider>
        <Toaster
        position="top-center"
        reverseOrder={false}
        />
    </>
);
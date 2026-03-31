import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Force light mode permanently
    const [theme] = useState('light');

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('bs-theme', 'light');
    }, []);

    const toggleTheme = () => {
        // Function disabled as dark mode is being removed
        console.log("Theme toggle is disabled; dark mode is removed.");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}


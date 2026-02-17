import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('bs-theme') || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Set Bootstrap's data-bs-theme attribute
        root.setAttribute('data-bs-theme', theme);
        localStorage.setItem('bs-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
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


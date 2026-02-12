import React from 'react'

function ThemeToggle({ currentTheme, onThemeChange }) {
    const themes = [
        { id: 'dark-green', label: 'Dark', icon: '🌙' },
        { id: 'light', label: 'Light', icon: '☀️' },
        { id: 'blue-dark', label: 'Blue Dark', icon: '💎' }
    ]

    return (
        <div className="theme-toggle-container">
            {themes.map(theme => (
                <button
                    key={theme.id}
                    className={`theme-toggle-btn ${currentTheme === theme.id ? 'active' : ''}`}
                    onClick={() => onThemeChange(theme.id)}
                    title={`Switch to ${theme.label} theme`}
                    aria-label={`Switch to ${theme.label} theme`}
                >
                    <span className="theme-icon">{theme.icon}</span>
                </button>
            ))}
        </div>
    )
}

export default ThemeToggle

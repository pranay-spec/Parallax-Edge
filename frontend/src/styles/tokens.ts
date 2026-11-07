export const tokens = {
    typography: {
        heading: {
            fontSize: '32px',
            lineHeight: '1.2',
            fontWeight: 800,
            letterSpacing: '-0.8px',
        },
        section: {
            fontSize: '20px',
            lineHeight: '1.3',
            fontWeight: 700,
            letterSpacing: '-0.4px',
        },
        body: {
            fontSize: '14px',
            lineHeight: '1.5',
            fontWeight: 500,
        },
        metadata: {
            fontSize: '12px',
            lineHeight: '1.4',
            fontWeight: 600,
            letterSpacing: '0.2px',
        },
    },
    spacing: {
        xs: '8px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
    },
    colors: {
        bgMain: '#0f0f12',
        bgCard: '#111114',
        bgSurface: '#18181b',
        border: '#1f1f24',
        borderLight: '#27272a',
        
        // Semantic status colors with high contrast text pairs
        positive: {
            main: '#22c55e',
            light: '#4ade80',
            bg: 'rgba(34, 197, 94, 0.12)',
            border: 'rgba(34, 197, 94, 0.25)',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            bg: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.25)',
        },
        critical: {
            main: '#ef4444',
            light: '#f87171',
            bg: 'rgba(239, 68, 68, 0.12)',
            border: 'rgba(239, 68, 68, 0.25)',
        },
        info: {
            main: '#06b6d4',
            light: '#38bdf8',
            bg: 'rgba(6, 182, 212, 0.12)',
            border: 'rgba(6, 182, 212, 0.25)',
        },
        
        textPrimary: '#ffffff',
        textSecondary: '#a1a1aa',
        textMuted: '#71717a',
    },
};

'use client';

import { PlatformType, PLATFORM_CONFIG } from '@/types';

interface PlatformBadgeProps {
    platform: PlatformType;
    size?: 'sm' | 'md' | 'lg';
}

export default function PlatformBadge({ platform, size = 'md' }: PlatformBadgeProps) {
    const config = PLATFORM_CONFIG[platform];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <span
            className={`inline-flex items-center font-semibold rounded-full ${config?.badgeClass || ''} ${sizeClasses[size]}`}
        >
            {config.name}
        </span>
    );
}

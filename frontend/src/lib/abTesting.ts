'use client';

import { useEffect, useState } from 'react';

const AB_TEST_KEY = 'parallax_ab_variant';

export function useABTesting(experimentName: string = 'global_ui_test') {
    const [variant, setVariant] = useState<'A' | 'B'>('A');

    useEffect(() => {
        // Retrieve or assign variant
        let storedVariant = localStorage.getItem(AB_TEST_KEY);
        if (!storedVariant) {
            storedVariant = Math.random() > 0.5 ? 'B' : 'A';
            localStorage.setItem(AB_TEST_KEY, storedVariant);
        }
        setVariant(storedVariant as 'A' | 'B');

        // Log to backend
        fetch('http://localhost:8000/ab-test/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'local_user',
                variant_id: storedVariant,
                event_type: `view_${experimentName}`
            })
        }).catch(err => console.error('Failed to log A/B test', err));
    }, [experimentName]);

    return variant;
}

import { UnitSystem } from '../types';

export const KM_TO_MILES = 0.621371;

export const formatDistance = (
    km: number,
    unitSystem: UnitSystem,
    withUnit: boolean = true,
    precision: number = 1
): string => {
    if (unitSystem === 'imperial') {
        const miles = km * KM_TO_MILES;
        const formatted = miles.toFixed(precision);
        return withUnit ? `${formatted} mi` : formatted;
    }
    const formatted = km.toFixed(precision);
    return withUnit ? `${formatted} km` : formatted;
};

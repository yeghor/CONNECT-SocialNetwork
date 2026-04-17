import { tz, dateLocales } from "../consts"

export const displayDayWithTZ = (date: Date): string => {
    const dateFormatter = Intl.DateTimeFormat(dateLocales,
        {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    return dateFormatter.format(date);
};
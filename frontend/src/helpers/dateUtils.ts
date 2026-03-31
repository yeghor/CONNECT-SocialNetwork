import { tz, dateLocales } from "../consts"

export const displayDayWithTZ = (date: Date): string => {
    console.log(date)
    const dateFormatter = Intl.DateTimeFormat(dateLocales,
        {
            timeZone: tz,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    console.log(tz)
    console.log(dateLocales)
    console.log(dateFormatter.format(date))
    return dateFormatter.format(date);
};
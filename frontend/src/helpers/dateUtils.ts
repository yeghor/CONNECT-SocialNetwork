import { tz, dateLocales } from "../consts"

export const changeDateTz = (dateString: string | null): Date | null => {
    if (!dateString) {
        return null;
    }
    const intlDateObject = Intl.DateTimeFormat(dateLocales, { timeZone: tz });
    return new Date(intlDateObject.format(new Date(dateString)));
}
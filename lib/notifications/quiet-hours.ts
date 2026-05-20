import { DateTime } from "luxon";

const QUIET_START_HOUR = 22;
const QUIET_END_HOUR = 7;

export function isQuietHours(timezone = "America/La_Paz", date = new Date()) {
    const localNow = DateTime.fromJSDate(date).setZone(timezone);
    const hour = localNow.hour;

    return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR;
}

export function nextAllowedTime(timezone = "America/La_Paz", date = new Date()) {
    const localNow = DateTime.fromJSDate(date).setZone(timezone);

    let next = localNow.set({
        hour: QUIET_END_HOUR,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    if (localNow >= next) {
        next = next.plus({ days: 1 });
    }

    return next.toUTC().toJSDate();
}
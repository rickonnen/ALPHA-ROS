export function isQuietHours(timezone = "America/La_Paz") {
    const now = new Date();

    const localTime = new Date(
        now.toLocaleString("en-US", {
            timeZone: timezone,
        })
    );

    const hour = localTime.getHours();

    // No molestar: 22:00 → 07:00
    return hour >= 22 || hour < 7;
}

export function nextAllowedTime(timezone = "America/La_Paz") {
    const now = new Date();

    const localTime = new Date(
        now.toLocaleString("en-US", {
            timeZone: timezone,
        })
    );

    localTime.setHours(7, 0, 0, 0);

    // Si ya pasaron las 7am → programar mañana
    if (now.getHours() >= 7) {
        localTime.setDate(localTime.getDate() + 1);
    }

    return localTime;
}
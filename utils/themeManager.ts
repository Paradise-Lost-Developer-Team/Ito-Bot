export const themes = ['Mahjong', 'Normal'];
const guildThemes = new Map<string, string>();

export function setTheme(guildId: string, theme: string) {
    guildThemes.set(guildId, theme);
}

export function getTheme(guildId: string) {
    return guildThemes.get(guildId) ?? null;
}

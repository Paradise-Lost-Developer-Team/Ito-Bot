export const topicsByTheme: Record<string, string[]> = {
    mahjong: []
};

export function drawTopic(theme: string): string {
    const list = topicsByTheme[theme] || [];
    if (list.length === 0) throw new Error(`No topics for theme ${theme}`);
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
}

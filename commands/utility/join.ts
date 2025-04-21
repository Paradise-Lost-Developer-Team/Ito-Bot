import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageFlags } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('ゲームに参加を表明します');

export async function execute(interaction: CommandInteraction) {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply({
            content: 'このコマンドはサーバー内でのみ使用できます。',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const dataDir = path.resolve(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'joiners.json');
    let allJoiners: Record<string, string[]> = {};

    // ファイル読み込み
    if (fs.existsSync(filePath)) {
        try {
            allJoiners = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch {
            allJoiners = {};
        }
    }

    // ギルドごとのリストを取得
    const list = allJoiners[guildId] || [];
    const userId = interaction.user.id;

    if (list.includes(userId)) {
        await interaction.reply({
            content: '既に参加表明済みです',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // 参加を追加して保存
    list.push(userId);
    allJoiners[guildId] = list;
    fs.writeFileSync(filePath, JSON.stringify(allJoiners, null, 2), 'utf8');

    await interaction.reply('参加表明しました！');
}

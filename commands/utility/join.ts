import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageFlags } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export const data = new SlashCommandBuilder()
    .setName('join')
    .setDescription('ゲームに参加を表明します');

export async function execute(interaction: CommandInteraction) {
    const dataDir = path.resolve(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'joiners.json');
    let list: string[] = [];

    // 既存の参加リスト読み込み
    if (fs.existsSync(filePath)) {
        try {
            list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch {
            list = [];
        }
    }

    const userId = interaction.user.id;
    if (list.includes(userId)) {
        await interaction.reply({ content: '既に参加表明済みです', flags: MessageFlags.Ephemeral });
        return;
    }

    // 参加リストに追加して保存
    list.push(userId);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');

    await interaction.reply({ content: '参加表明しました！' });
}

import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { getTheme } from '../../utils/themeManager';
import { hasGame, createGame, drawNewTopic } from '../../utils/gameManager';

export const data = new SlashCommandBuilder()
  .setName('start')
  .setDescription('新しい Ito ゲームを開始します');

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId!;
  if (hasGame(guildId)) {
    await interaction.reply('すでにゲームが開始されています。');
    return;
  }
  const theme = getTheme(guildId);
  if (!theme) {
    await interaction.reply('お題テーマが設定されいません。`/theme` で先に設定してください。');
    return;
  }
  createGame(guildId, theme);
  try {
    const topic = drawNewTopic(guildId);
    await interaction.reply(
      `ゲームを開始しました！ お題テーマは **${theme}**、最初のお題は **${topic}** です。`
    );
  } catch (error: any) {
    if (error.message.includes('No topics for theme')) {
      await interaction.reply({
        content: `指定されたテーマ「${theme}」にはトピックがありません。別のテーマを選択してください。`,
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    throw error;
  }
}

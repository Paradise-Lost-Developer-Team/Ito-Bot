import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { hasGame, playCard } from '../../utils/gameManager';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('手札を場に出します')
  .addIntegerOption(opt =>
    opt
      .setName('card')
      .setDescription('出すカードの数字')
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId!;
  const card = interaction.options.getInteger('card', true);
  if (!hasGame(guildId)) {
    await interaction.reply('ゲームが開始されていません。`/start` で開始してください。');
    return;
  }
  const result = playCard(guildId, interaction.user.id, card);
  switch (result.status) {
    case 'start':
      await interaction.reply(`最初のカードを **${result.card}** で出しました！脱出開始！`);
      break;
    case 'ok':
      await interaction.reply(`**${result.card}** を出しました。次のカードを出してください。`);
      break;
    case 'fail':
      await interaction.reply(
        `ストップ！失敗しました。\nよけたカード: ${result.pile.join(', ')} (${result.removedCount}枚)\n` +
        `ライフが **${result.lives}** に減少しました。`
      );
      break;
  }
}

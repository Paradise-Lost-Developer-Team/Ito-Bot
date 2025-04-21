import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { checkGameEnd, deleteGame } from '../../utils/gameManager';

export const data = new SlashCommandBuilder()
  .setName('end')
  .setDescription('ゲーム終了条件を確認し、結果を通知します');

export async function execute(interaction: ChatInputCommandInteraction) {
  const gid = interaction.guildId!;
  const result = checkGameEnd(gid);
  if (result === 'win') {
    await interaction.reply('脱出成功！全員勝利です🎉');
    deleteGame(gid);
  } else if (result === 'lose') {
    await interaction.reply('ゲームオーバー…脱出失敗でした💥');
    deleteGame(gid);
  } else {
    await interaction.reply('まだ終了条件を満たしていません。');
  }
}

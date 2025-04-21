import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { hasGame, prepareNextStage, drawNewTopic } from '../../utils/gameManager';

export const data = new SlashCommandBuilder()
  .setName('nextstage')
  .setDescription('次のステージの準備を行います');

export async function execute(interaction: ChatInputCommandInteraction) {
  const gid = interaction.guildId!;
  if (!hasGame(gid)) {
    await interaction.reply('ゲームが開始されていません。`/start` で開始してください。');
    return;
  }

  // ステージの進行準備
  const { stage, lives, momoCard } = prepareNextStage(gid);

  let msg = `ステージ **${stage}** の準備が完了しました。\nライフ: **${lives}**\n`;

  // 2ステージ以降はお題を引く
  if (stage >= 2) {
    const topic = drawNewTopic(gid);
    msg += `お題: **${topic}**\n`;
  }

  if (momoCard !== undefined) {
    msg += `モモちゃん発見！ナンバー **${momoCard}** を場の脇に置きました。\n`;
  }

  msg += '各プレイヤーは `/draw` で配られた手札をご確認ください。';
  await interaction.reply(msg);
}

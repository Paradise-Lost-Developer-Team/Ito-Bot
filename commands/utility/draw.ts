import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { hasGame, drawHand } from '../../utils/gameManager';

export const data = new SlashCommandBuilder()
  .setName('draw')
  .setDescription('自分の手札を確認します');

export async function execute(interaction: ChatInputCommandInteraction) {
  const gid = interaction.guildId!;
  if (!hasGame(gid)) {
    await interaction.reply({
      content: 'ゲームが開始されていません。`/start` で開始してください。',
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  const hand = drawHand(gid, interaction.user.id);
  await interaction.reply({
    content: `あなたの手札: ${hand}`,
    flags: MessageFlags.Ephemeral
  });
}

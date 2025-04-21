import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('talk')
  .setDescription('フリートークタイムを開始します');

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply('フリートークタイム開始！誰でも /play で手札を場に出せます。');
}

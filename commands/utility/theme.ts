import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { themes, setTheme } from '../../utils/themeManager';

export const data = new SlashCommandBuilder()
    .setName('theme')
    .setDescription('ゲームのお題テーマを設定します')
    .addStringOption(option =>
    option
        .setName('topic')
        .setDescription('設定するテーマの内容')
        .setRequired(true)
        .addChoices(...themes.map(t => ({ name: t, value: t })))
    );

    export async function execute(interaction: ChatInputCommandInteraction) {
        const topic = interaction.options.getString('topic', true);
    // テーマを保存
    setTheme(interaction.guildId!, topic);
        await interaction.reply(`お題のテーマを **${topic}** に設定しました。`);
    }

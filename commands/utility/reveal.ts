import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export const data = new SlashCommandBuilder()
    .setName('reveal')
    .setDescription('場に出されたカードの数字を全員に公開します');

export async function execute(interaction: CommandInteraction) {
    const file = path.resolve(process.cwd(), 'data', 'lastMove.json');
    if (!fs.existsSync(file)) {
        await interaction.reply({ content: 'まだカードが場に出されていません。', flags: MessageFlags.Ephemeral });
        return;
    }

    const { color, number } = JSON.parse(fs.readFileSync(file, 'utf8'));
    const embed = new EmbedBuilder()
        .setTitle('📣 場のカード公開')
        .addFields(
            { name: '数字', value: number.toString(), inline: true }
        )
        .setColor(0xE74C3C);

    await interaction.reply({ embeds: [embed] });
}

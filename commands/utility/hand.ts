import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

export const data = new SlashCommandBuilder()
    .setName('hand')
    .setDescription('自分の現在の手札を確認します');

    export async function execute(interaction: CommandInteraction) {
    const filePath = path.resolve(process.cwd(), 'data', 'hands.json');
    let hands: Record<string, string[]> = {};

    if (fs.existsSync(filePath)) {
        try {
        hands = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch {
        hands = {};
        }
    }

    const userId = interaction.user.id;
    const hand = hands[userId] || [];
    if (hand.length === 0) {
        await interaction.reply({ content: 'あなたの手札は空です。', flags: MessageFlags.Ephemeral });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('🎴 あなたの手札')
        .setDescription(hand.join('、'))
        .setColor(0xF1C40F);

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

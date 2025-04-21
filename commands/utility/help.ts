import { SlashCommandBuilder } from '@discordjs/builders';
import {
    CommandInteraction,
    EmbedBuilder,
    MessageFlags,
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

// ページング用 Embed を返す関数
function getHelpPages(): EmbedBuilder[] {
    const page1 = new EmbedBuilder()
        .setTitle('★表現のポイント！★')
        .setDescription([
            '・名詞の表現を優先: 「ゴリラ」',
            '・名詞が難しい場合は形容詞: 「ゴリラよりちょっと小さいくらいの生き物」',
            '・補足を加えると好印象: 「ちょっとガタイ良さげな子供のゴリラ」',
            '・何度でも表現を変更可能: 「やっぱゴリラじゃなくてサイ！」',
            '・複数人同じ表現OK: 「私キリン！」「え。ぼくもキリン！」',
            '・質問を重ねてニュアンスを掴む: 「そっちのキリンってオス？ メス？」'
        ].join('\n'))
        .setColor(0x1ABC9C);

    const page2 = new EmbedBuilder()
        .setTitle('ゲーム進行 2/6: ゲーム開始')
        .setDescription([
            '• /theme - テーマを選択',
            '• /start - 新しいItoゲームを開始',
            '• 主催者が開始すると全員参加可能になります'
        ].join('\n'))
        .setColor(0x3498DB);

    const page3 = new EmbedBuilder()
        .setTitle('ゲーム進行 3/6: 参加登録と順番')
        .setDescription([
            '• /join - ゲームに参加登録',
            '• 参加者が揃ったら自動で順番を決定'
        ].join('\n'))
        .setColor(0x3498DB);

    const page4 = new EmbedBuilder()
        .setTitle('ゲーム進行 4/6: カードプレイ')
        .setDescription([
            '• /draw - 手札を引く',
            '• /talk - フリートークタイム開始',
            '• /play - カードを場にプレイ',
            '• 制限時間内に行動しないとスキップ'
        ].join('\n'))
        .setColor(0x3498DB);

    const page5 = new EmbedBuilder()
        .setTitle('ゲーム進行 5/6: 手札確認と終了')
        .setDescription([
            '• /hand - 現在の手札を確認',
            '• /reveal - 場のカードを公開',
            '• /nextstage - 次のステージに進む',
            '• /end  - ゲームを強制終了'
        ].join('\n'))
        .setColor(0x3498DB);

    const page6 = new EmbedBuilder()
        .setTitle('ゲーム進行 6/6: 公式ルール＆ヒント')
        .setDescription('詳しいルールは公式サイトを参照してください:\nhttps://arclightgames.jp/product/ito/')
        .setColor(0x3498DB);

    return [page1, page2, page3, page4, page5, page6];
}

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('表現のポイントを表示します');

export async function execute(interaction: CommandInteraction) {
    const pages = getHelpPages();
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('previous_0')
            .setLabel('戻る')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('next_0')
            .setLabel('次へ')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pages.length < 2)
    );
    await interaction.reply({
        embeds: [pages[0]],
        components: [row],
        flags: MessageFlags.Ephemeral
    });
}

export async function buttonHandler(interaction: ButtonInteraction) {
    const [action, idx] = interaction.customId.split('_');
    let page = parseInt(idx, 10);
    page = action === 'next' ? page + 1 : page - 1;

    const pages = getHelpPages();
    const hasPrev = page > 0;
    const hasNext = page < pages.length - 1;
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`previous_${page}`)
            .setLabel('戻る')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!hasPrev),
        new ButtonBuilder()
            .setCustomId(`next_${page}`)
            .setLabel('次へ')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!hasNext)
    );
    await interaction.update({ embeds: [pages[page]], components: [row] });
}
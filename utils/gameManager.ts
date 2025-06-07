import { drawTopic } from './topicManager';
import { promises as fs } from 'fs'
import path from 'path'

export interface ItoGame {
    players: string[];
    theme: string;
    currentTopic?: string;
    usedTopics: Set<string>;
    declarations: Map<string, string>;  // ユーザーID → 宣言文
    hands: Map<string, number[]>;
    stage: number;
    deck: number[];
    momoCard?: number;
    started: boolean;
    lastPlayed: number | null;
    pile: number[];
    lives: number;
    playedNumbers?: Map<string, number>;
}

const games = new Map<string, ItoGame>();

export function hasGame(guildId: string): boolean {
    return games.has(guildId);
}

export function createGame(guildId: string, theme: string): ItoGame {
    const game: ItoGame = {
        players: [],
        theme,
        usedTopics: new Set(),
        declarations: new Map(),
        hands: new Map(),
        stage: 0,
        deck: [],
        started: false,
        lastPlayed: null,
        pile: [],
        lives: 3
    };
    games.set(guildId, game);
    return game;
}

export function getGame(guildId: string): ItoGame | undefined {
    return games.get(guildId);
}

export function drawNewTopic(guildId: string): string {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    let topic: string;
    do {
        topic = drawTopic(game.theme);
    } while (game.usedTopics.has(topic));
    game.usedTopics.add(topic);
    game.currentTopic = topic;
    return topic;
}

/** ユーザーの宣言を登録。既に宣言済みなら false を返す */
export function declareHand(guildId: string, userId: string, clue: string): boolean {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    if (game.declarations.has(userId)) return false;
    game.declarations.set(userId, clue);
    return true;
}

/** 現在の宣言一覧を返す */
export function getDeclarations(guildId: string): Map<string, string> {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    return game.declarations;
}

/** 宣言データをクリア */
export function clearDeclarations(guildId: string): void {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    game.declarations.clear();
}

/** 指定ユーザーに0〜100の数字をランダムで引かせる。既に引いていればその数字を返す */
export function drawHand(guildId: string, userId: string): number {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    // 既に手札があるならそれを返す
    if (game.hands.has(userId)) {
        return game.hands.get(userId)![0];
    }
    // 重複しないようにランダムで数字を選ぶ
    let num: number;
    const used = new Set<number>(Array.from(game.hands.values()).flat());
    do {
        num = Math.floor(Math.random() * 101);  // 0〜100
    } while (used.has(num));
    game.hands.set(userId, [num]);
    return num;
}

export type PlayResult =
    | { status: 'start'; card: number }
    | { status: 'ok'; card: number }
    | { status: 'fail'; card: number; removedCount: number; pile: number[]; lives: number };

/** カードを場に出し、昇順チェック／失敗時の処理 */
export function playCard(guildId: string, userId: string, card: number): PlayResult {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');

    // プレイヤーと引いた数字を一時的に保存
    if (!game["playedNumbers"]) {
        game["playedNumbers"] = new Map<string, number>();
    }
    game["playedNumbers"].set(userId, card);

    // ゲーム未開始なら初手扱い
    if (!game.started) {
        game.started = true;
        game.lastPlayed = card;
        game.pile.push(card);
        return { status: 'start', card };
    }

    // 昇順なら成功
    if (card >= (game.lastPlayed ?? 0)) {
        game.lastPlayed = card;
        game.pile.push(card);
        return { status: 'ok', card };
    }

    // 失敗時の処理：出せなかったプレイヤーの数だけよけた枚数としてライフを減らす
    const removedCount = game.players.length - game.pile.length;
    const removedPile = [...game.pile];
    game.lives = Math.max(0, game.lives - removedCount);

    // 場をクリアして次のステージ準備
    game.pile = [];
    game.started = false;
    game.lastPlayed = null;

    return { status: 'fail', card, removedCount, pile: removedPile, lives: game.lives };
}

export function getLives(guildId: string): number {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    return game.lives;
}

/** 次ステージの準備を行う */
export function prepareNextStage(guildId: string) {
    const game = games.get(guildId);
    if (!game) throw new Error('Game not found');
    // ステージインクリメント
    game.stage = game.stage + 1;
    // ステージクリアボーナス：3人以上のときのみライフ+1（上限3）
    if (game.players.length > 2) {
        game.lives = Math.min(3, game.lives + 1);
    }
    // ② 山札作成・シャッフル
    game.deck = Array.from({ length: 101 }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
    // モモちゃん発見（3rdステージのみ）
    if (game.stage === 3) {
        game.momoCard = game.deck.shift();
    } else {
        delete game.momoCard;
    }
    // ③ 手札配り直し
    game.hands.clear();
    const drawCount = game.stage;
    for (const uid of game.players) {
        const hand: number[] = [];
        for (let i = 0; i < drawCount; i++) {
            const c = game.deck.shift()!;
            hand.push(c);
        }
        game.hands.set(uid, hand);
    }
    // ④ その他リセット
    game.usedTopics.clear();
    game.declarations.clear();
    game.pile = [];
    game.started = false;
    game.lastPlayed = null;

    return {
        stage: game.stage,
        lives: game.lives,
        momoCard: game.momoCard,
        hands: Object.fromEntries(game.hands)
    };
}

/** ゲーム終了判定: 'win' | 'lose' | null */
export function checkGameEnd(guildId: string): 'win' | 'lose' | null {
    const game = games.get(guildId);
    if (!game) return null;
    // ライフ0 → 敗北
    if (game.lives <= 0) return 'lose';
    // 第3ステージをクリアしたら勝利
    const allEmpty = Array.from(game.hands.values()).every(h => h.length === 0);
    if (game.stage >= 3 && allEmpty) {
        return 'win';
    }
    return null;
}

/** ゲームデータを削除 */

const JOINERS_PATH = path.resolve(__dirname, '../joiners.json')

export async function deleteGame(guildId: string): Promise<void> {
    // メモリ上のゲームデータ削除
    games.delete(guildId)

    // joiners.json からも該当 guildId を削除
    try {
        const raw = await fs.readFile(JOINERS_PATH, 'utf8')
        const joiners = JSON.parse(raw) as Record<string, unknown>
        if (guildId in joiners) {
            delete joiners[guildId]
            await fs.writeFile(JOINERS_PATH, JSON.stringify(joiners, null, 2), 'utf8')
        }
    } catch (err) {
        console.error('Failed to update joiners.json:', err)
    }
}

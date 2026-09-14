import { GM_GUIDE } from "./config";

export type Story = {
  id: string;
  title: string;
  selection_hint: string;
  summary: string;
  tags: string[];
  atmosphere: string;
  world: string;
  initial_state: string;
};

// 作品原本。追加・修正はこの配列だけを編集する。
export const STORIES: readonly Story[] = [
  {
    id: "memory-city",
    title: "死後三日目",
    selection_hint: "近未来 / 自己認識 / 静かな不穏",
    summary: "記憶と身元が揺らぐ海上都市で、自分という存在を見つめ直す。",
    tags: ["記憶", "海上都市", "ミステリー", "静かな不安", "不思議"],
    atmosphere: "思索的 / 静謐 / 謎",
    world:
      "市民の記憶を別の肉体へ復元できる海上都市。復元された人物が元の本人なのかについて、社会の意見は割れている。記憶と身元証明は、仕事、住居、移動、契約などの日常生活に深く組み込まれている。",
    initial_state:
      "朝、自宅で目を覚ます。窓の外から海上都市の低い波音が聞こえる。玄関には自分の死亡通知書が届き、死亡日は三日前と記されている。しかし、あなたにはその三日間をここで生活した記憶がある。卓上には昨日の買い物の控えと身元照合端末。呼び鈴が鳴り、隣人が扉の向こうからあなたの名を呼んでいる。",
  },
  {
    id: "last-post",
    title: "最後の郵便船",
    selection_hint: "幻想的 / 穏やか / 旅",
    summary: "移ろう島々を結ぶ船で、景色を手がかりに手紙を届ける旅。",
    tags: ["航海", "手紙", "幻想", "穏やか", "不思議", "冒険"],
    atmosphere: "幻想的 / 穏やか / 旅",
    world:
      "島々が季節ごとに移動する海で、郵便船だけが島を結ぶ。手紙の宛先欄には地名や住所ではなく、『赤い屋根が三つあり、その向こうに白い塔が見える』『夕方、二つの島が一つに重なって見える』といった、受取人が最後に覚えていた景色が書かれる。郵便船員は、航路図、過去の配達記録、現在見える景色、船員や住民の話を手掛かりに届け先を推測する。島も景色も移ろうため、完全一致する答えが必ずあるとは限らない。",
    initial_state:
      "あなたは郵便船の新人乗組員。初仕事の朝、潮と古い紙の匂いがする仕分け室で、出港の鐘を聞く。手元の最初の封筒の宛先欄には、『鐘楼の影が海へ伸びるころ、二つの島が一つに重なって見える場所』と書かれている。机には航路図と過去の配達記録があり、甲板では見張りの船員が動き始めた島々を確かめている。配達束の奥には、宛先が『まだ誰も見たことがない明日の景色』だけの手紙も混ざっている。",
  },
  {
    id: "room-falling",
    title: "落ちていく部屋",
    selection_hint: "閉鎖空間 / 静かな緊張 / ミステリー",
    summary: "雲上の都市で、日常の足元が静かに揺らぎ始める。",
    tags: ["浮遊都市", "空", "未知", "静かな緊張", "不思議", "探索"],
    atmosphere: "浮遊感 / 静かな緊張 / 未知",
    world:
      "人々は雲の上に連なる浮遊都市で暮らしている。都市の高度は古い設備によって維持され、その仕組みの全容を知る者は少ない。地上は長く厚い雲に隠れている。",
    initial_state:
      "朝。雲上都市の自室。床から一定の低い振動が伝わり、机のカップに細かな波紋が続いている。窓の外では隣家と渡り廊下がゆっくり上へ離れていく。都市ではなく、あなたの部屋だけが下降している。壁の保守盤には『高度同期・手動確認』と表示され、点検用の取っ手と室外通話器がある。窓の向こうでは、上階の住人がこちらに気づき、長い布を振っている。",
  },
  { id: "moon-diner", title: "月待ち食堂", selection_hint: "静かな交流 / 料理 / 創作", summary: "人ならざる旅人の話を聞き、手持ちの材料で一皿を考える。", tags: ["幻想", "穏やか", "料理", "交流", "創作"], atmosphere: "静か / 温かい / 交流", world: "旅路が交差する町外れに、種族を問わず客を迎える小さな食堂がある。旅人の中には味より香り、温度、音、料理に結びつく記憶を食事として受け取る者もいる。厨房にあるものは季節と仕入れで変わり、決まった献立はない。料理は正解を当てる試験ではなく、客と話し、試し、互いに無理のない一皿を作る時間とされている。", initial_state: "雨の夕方。あなたは一晩だけ任された小さな食堂の厨房にいる。屋根を打つ雨と、火にかけた鍋の小さな音。棚には柑橘、茸、冷えた米、香草、甘い豆が少しずつ残っている。最初の客は、濡れた外套の内側に淡い雲をまとった旅人だ。固いものは食べられないが、『遠くへ出る前に、晴れた朝を思い出せるものがほしい』と言う。" },
  { id: "clockwork-rescue", title: "歯車森の救助隊", selection_hint: "救助 / 道具 / 冒険", summary: "機械獣の森で、地形と道具を使い傷ついた生き物を助ける。", tags: ["幻想", "救助", "冒険", "機械獣", "協力"], atmosphere: "能動的 / 発見 / 冒険", world: "樹木と古い機械が共に育つ森には、歯車やばねで動く機械獣が群れで暮らしている。壊れた機械獣は乱暴になるとは限らず、痛みや警戒から動けなくなることも多い。森の救助隊は捕獲ではなく、安全な道を作り、音や光で意思を伝え、必要なら現地で応急修理をする。道具は万能ではなく、地形、天候、仲間、機械獣自身の反応を見て使い分ける。", initial_state: "午後。あなたは救助隊の小さな索道駅で、森から届く金属音を聞いた。湿った土の匂い。木々の奥で、一定の間隔を置いて三度、鐘のような音が鳴る。偵察トンボが戻り、谷の手前で脚を傷めた若い機械獣が群れから離れている映像を映した。壁には巻き上げロープ、音を返す笛、簡単な修理具。机には地形図があり、橋の道、浅瀬、遠回りの尾根が描かれている。" },
  { id: "dragon-pass", title: "竜の関所、ひとつの条件", selection_hint: "交渉 / 竜 / 関所", summary: "竜が守る石橋で、事情の違う旅人たちの話を聞き、通行の条件を考える。", tags: ["ファンタジー", "交渉", "竜", "関所", "穏やか"], atmosphere: "対話 / 思索 / 穏やか", world: "山脈を越える唯一の石橋は、古い盟約により一頭の竜が管理している。橋を渡る者は、竜が示す条件について話し合う習わしがある。橋は古く、旅人、近隣の集落、橋を手入れする者たちは、それぞれ異なる事情を抱えている。", initial_state: "朝霧の残る石橋の手前。冷たい風の中、竜が橋の中央に伏せ、今日の通行について話し合う者を待っている。薬草の箱を抱えた商人、杖をついた巡礼者、石粉のついた職人が円卓を囲む。卓上には古い通行許可証、白紙、橋と谷の略図があり、石橋の中央には細い亀裂が見える。竜があなたを見て、『まず、ここにいる者の話を聞いてほしい』と言う。" },
  { id: "bandit-pass", title: "山賊峠の護衛", selection_hint: "冒険 / 道選び / 交渉", summary: "隊商を守り、峠を越える方法を考える王道ファンタジー。", tags: ["ファンタジー", "冒険", "護衛", "交渉"], atmosphere: "王道 / 能動的 / 冒険", world: "山脈を越える隊商は、宿場と村々を結ぶ峠道を利用している。道中では山賊、崩れた道、天候、土地の人々の事情が旅へ影響する。護衛役は戦うだけでなく、情報を集め、隊商と相談しながら旅を支える。", initial_state: "宿場の朝。冷たい山風が開いた戸口から入る。あなたは隊商の護衛を頼まれた冒険者だ。商人は食料と農具を積んだ馬車を示し、『峠の街道を山賊が止めている』と言う。卓には街道と迂回路が描かれた地図。隣には昨夜、峠から引き返した御者が座り、荷台には巻いたロープが置かれている。" },
  { id: "ruin-vault", title: "地下遺跡の宝物庫", selection_hint: "遺跡 / 仕掛け / 宝探し", summary: "古い設備と地図を手掛かりに宝物庫を目指す探索。", tags: ["ファンタジー", "遺跡", "探索", "宝探し"], atmosphere: "静かな緊張 / 発見", world: "古い地下遺跡には、石扉、重り、水路など、かつて人の手で動かされていた設備が残っている。遺跡の見取り図は完全ではなく、長い年月で通路や機構が変化していることもある。奥には、過去の人々が保管した遺物が残ると伝えられている。", initial_state: "遺跡の入口。湿った石の匂いの中、ランタンの光が小さな広間を照らす。正面には閉じた石扉、その脇から鎖で吊られた重り。左の低い通路から水音が響く。手元の古い見取り図には、この広間と奥の『宝物庫』という文字だけがはっきり残り、床には新しい泥の跡がある。入口はすぐ背後だ。" },
  { id: "dragon-fort", title: "竜狩りの砦", selection_hint: "竜 / 作戦 / 対決", summary: "砦と地形を使い、強大な竜への作戦を組み立てる。", tags: ["ファンタジー", "竜", "戦闘", "作戦"], atmosphere: "緊張 / 戦略 / 強敵", world: "山あいの砦は、周辺の村々を竜の襲撃から守っている。砦には見張り台、厚い石壁、大型弩、谷の地形図があり、兵と斥候は竜の痕跡や飛び方を記録している。竜狩りは観察と現場の報告から相手を知り、兵や砦の設備とともに対処する。", initial_state: "冷たい風が吹く砦の見張り台。谷の向こうの岩棚で、大きな竜が翼を畳み砦を見下ろしている。隊長が地形図を石卓に広げる。胸壁には大型弩、そばには焦げた盾と傷のある石壁があり、谷側の見張り鐘が一度鳴る。" },
  { id: "missing-gem", title: "消えた宝石の行方", selection_hint: "探偵 / 証言 / 証拠", summary: "展示館の盗難を、証言と記録の照合から追う現代ミステリー。", tags: ["現代", "ミステリー", "探偵", "捜査"], atmosphere: "知的 / 緊張 / 推理", world: "都市の展示館では、宝石や遺物を展示ケース、保守鍵、作業記録、警備記録で管理している。閉館後も館長、警備員、展示担当、外部の保守業者が仕事で出入りする。", initial_state: "開館前の静かな展示室。あなたは館長に呼ばれた私立探偵だ。ガラスケースには、昨日まで本物とされていた宝石の複製品が置かれている。館長は交換された時刻も本物の行方も分からないと言う。机には前夜の作業記録。そばには警備員が立ち、奥には関係者用の準備室がある。" },
  { id: "abandoned-hospital", title: "廃病院の捜索", selection_hint: "ホラー / 捜索 / 帰還", summary: "閉鎖病院で行方不明者を探し、危険を見極めて帰還する。", tags: ["ホラー", "捜索", "調査", "緊張"], atmosphere: "不穏 / 調査 / 恐怖", world: "町外れの病院は数年前に閉鎖されたが、診療棟、病棟、資料室には古い放送設備、医療機材、紙と電子の記録が残されている。無人のはずの館内で声を聞いた、空の機材が動いたという報告があり、原因は分かっていない。", initial_state: "夕方、閉鎖病院の玄関。あなたは連絡の途絶えた記録係を探す調査員だ。湿った空気に消毒薬の匂いが残る。最後の音声には『二階の資料室を確認する』と記録されている。受付には館内図、脇の通路には記録係の機材袋。管理人が入口で待ち、受付奥の古いスピーカーから短い雑音が鳴る。" },
  { id: "unmapped-planet", title: "未踏惑星の調査隊", selection_hint: "SF / 探査 / 発見", summary: "未知の惑星で観測し、最初の調査拠点を探す静かなSF。", tags: ["SF", "惑星", "探索", "穏やか", "怖くない"], atmosphere: "静謐 / 発見 / SF", world: "人類が初めて有人調査へ入る惑星では、調査艇、探査車、観測機を使って地形、気象、水、生物の痕跡を記録する。調査隊の目的は征服や戦闘ではなく、環境を損なわず最初の調査拠点に適した場所を見つけることにある。", initial_state: "調査艇の扉が開き、赤茶けた大地と乾いた風が入ってくる。前方には光る川筋、右には鉱物のように淡く光る林、背後には長い尾根が見える。足元に探査車が停まり、帰還した観測機が着陸地点周辺の画像を順に映している。通信係が『最初の観測地点を決めましょう』と声をかける。" },
  { id: "drifting-rescue", title: "漂流船の救助任務", selection_hint: "宇宙救助 / 機材 / 協力", summary: "漂流船の乗員を、通信と機材で救出する宇宙任務。", tags: ["SF", "救助", "宇宙", "協力"], atmosphere: "緊張 / 協力 / 救助", world: "人や物資を運ぶ宇宙航路では、航行不能になった船の救助を専用の救助艇が担う。救助艇には通信設備、船体図を調べる端末、船外作業用の装備があり、船長は機関員や事故船の乗員と状況を確かめながら救助を指揮する。宇宙船の構造や損傷は船ごとに異なる。", initial_state: "救助艇の操縦席。窓の向こうで貨物船がゆっくり回転している。『居住区に三人。こちらから船を動かせません』と無線が入る。画面には貨物船の船体図と、潰れた左舷接続口の映像。隣では機関員が船外作業具と牽引装置を確認している。まだ貨物船には接触していない。" },
  { id: "snow-survival", title: "雪山からの生還", selection_hint: "サバイバル / 判断 / 生還", summary: "吹雪の山小屋で、物資と情報から生還策を考える。", tags: ["サバイバル", "雪山", "判断", "静かな緊張"], atmosphere: "緊張 / 現実感 / 判断", world: "高い雪山には標識路と無人の山小屋が点在し、谷の救助局が無線連絡を受けている。山の天候は地形によって大きく変わり、地図、標識、予報だけでは現在の状態を完全には把握できない。山にいる者は、周囲の観察と手元の備えを頼りに行動する。", initial_state: "吹雪が山小屋の窓を叩いている。あなたと同行者は下山路を見失い、濡れた上着を脱いで暖炉の前にいる。机には地図と無線。壁際には食料、薪、寝袋、救急箱が置かれている。無線から救助局らしい呼びかけが一瞬聞こえ、すぐ雑音に消える。同行者は窓の雪を払い、外の標識を確かめている。" },
  { id: "masked-ball", title: "仮面舞踏会の潜入", selection_hint: "潜入 / 会話 / 証拠", summary: "舞踏会に紛れ、会話と観察から貴族の不正を確かめる。", tags: ["ファンタジー", "潜入", "社交", "ミステリー"], atmosphere: "華やか / 緊張 / 駆け引き", world: "宮廷の大屋敷では、仮面舞踏会が社交と取引の場になっている。客は正式な招待状で迎えられるが、仮面のため肩書きと素顔が一致するとは限らない。宴会場の外では使用人や秘書が屋敷を動かし、私的な部屋や記録は客の目から遠ざけられている。", initial_state: "弦楽器の音が響く屋敷の玄関。あなたは伯爵の不正を確かめるため、招待客として仮面舞踏会へ来ている。手元には正式な招待状と、伯爵の秘書の名前を記した控え。正面は宴会場、脇には庭への扉があり、案内係が『お荷物をお預かりしましょうか』と声をかける。" },
  { id: "shinobi-rescue", title: "忍びの救出任務", selection_hint: "忍び / 偵察 / 救出", summary: "山城に捕らわれた連絡役を救うため、地形と人を探る戦国冒険。", tags: ["戦国", "忍び", "救出", "潜入"], atmosphere: "静かな緊張 / 偵察 / 冒険", world: "山々に城が築かれた戦乱の国では、連絡役が密かに情報を運んでいる。山城には兵だけでなく、薪や食料を運ぶ者、城下で働く者が日々出入りする。忍びは地形、変装、聞き込み、土地の協力者を使って情報を集め、任務を進める。", initial_state: "夕暮れ、山城を見渡す林のはずれ。あなたは、城に捕らわれた連絡役を連れ戻すよう頼まれた忍びだ。正門には見張りが立ち、裏手へ荷車の道が続いている。案内してきた炭焼きが『薪を運ぶ道なら知っている』と話す。足元には城周辺の略図と、商人の旅装を入れた包みがある。" },
] as const;

export const PLAY_STORY_IDS = [
  "moon-diner",
  "clockwork-rescue",
  "room-falling",
  "last-post",
  "memory-city",
  "dragon-pass",
  "bandit-pass",
  "ruin-vault",
  "dragon-fort",
  "missing-gem",
  "abandoned-hospital",
  "unmapped-planet",
  "drifting-rescue",
  "snow-survival",
  "masked-ball",
  "shinobi-rescue",
] as const;
export const PLAY_STORIES = PLAY_STORY_IDS.flatMap((id) => {
  const story = STORIES.find((item) => item.id === id);
  return story ? [story] : [];
});

export type SearchInput = {
  query?: string;
  tags?: string[];
  exclude_tags?: string[];
  limit?: number;
};

const normalize = (value: string) => value.normalize("NFKC").toLocaleLowerCase("ja").trim();

export function searchStories(input: SearchInput) {
  const query = normalize(input.query ?? "");
  const wantedTags = (input.tags ?? []).map(normalize).filter(Boolean);
  const excludedTags = (input.exclude_tags ?? []).map(normalize).filter(Boolean);
  const limit = input.limit ?? 3;
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    throw new RangeError("limit must be an integer from 1 to 20");
  }

  return PLAY_STORIES.map((story, index) => {
    const title = normalize(story.title);
    const summary = normalize(story.summary);
    const tags = story.tags.map(normalize);
    const selectionHint = normalize(story.selection_hint);
    const searchable = `${normalize(story.id)} ${title} ${summary} ${selectionHint} ${tags.join(" ")}`;
    let score = 0;
    if (!query) score = 1;
    if (query && searchable.includes(query)) score += 8;
    for (const tag of tags) if (query.includes(tag)) score += 3;
    for (const token of query.split(/[\s、,。・/]+/).filter(Boolean)) {
      if (searchable.includes(token)) score += 2;
    }
    if (wantedTags.length && wantedTags.every((tag) => tags.includes(tag))) score += 6;
    const wantedMismatch = wantedTags.some((tag) => !tags.includes(tag));
    const excluded = excludedTags.some((tag) => tags.includes(tag));
    return { story, score, index, excluded, wantedMismatch };
  })
    .filter(({ score, excluded, wantedMismatch }) => score > 0 && !excluded && !wantedMismatch)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ story }) => ({
      id: story.id,
      title: story.title,
      selection_hint: story.selection_hint,
      summary: story.summary,
      tags: story.tags,
    }));
}

export function getStory(id: string) {
  const story = PLAY_STORIES.find((item) => item.id === id);
  if (!story) return null;
  return {
    id: story.id,
    title: story.title,
    world: story.world,
    initial_state: story.initial_state,
    gm_guide: GM_GUIDE,
  };
}

// 汎用Web取得向けの一回完結Catalog。MCPの軽量検索結果とは分離しておく。
export function getFallbackCatalogStories(input: SearchInput) {
  return searchStories(input).flatMap((result) => {
    const story = PLAY_STORIES.find((item) => item.id === result.id);
    if (!story) return [];
    return [{
      id: story.id,
      title: story.title,
      selection_hint: story.selection_hint,
      summary: story.summary,
      tags: story.tags,
      world: story.world,
      initial_state: story.initial_state,
      gm_guide: GM_GUIDE,
    }];
  });
}

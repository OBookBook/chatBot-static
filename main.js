const chatbox = document.getElementById("chatbox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const toggleChat = document.getElementById("toggleChat");
const chatHeader = document.querySelector(".chat-header");

// 会話の文脈を保存する変数
let conversationContext = {
  lastTopic: null,
  userName: null,
  askedAboutUser: false,
  mentionedTopics: [],
};

// イベントリスナーの設定
function setupEventListeners() {
  // チャットの表示/非表示を切り替える
  chatHeader.addEventListener("click", toggleChatVisibility);

  // Enterキーでメッセージを送信
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  sendButton.addEventListener("click", sendMessage);
}

// チャットの表示/非表示を切り替える関数
function toggleChatVisibility() {
  const chatContent = document.querySelector("#chatbox");
  const inputArea = document.querySelector(".input-area");

  if (chatContent.style.display === "none") {
    chatContent.style.display = "flex";
    inputArea.style.display = "flex";
    toggleChat.textContent = "▼";
  } else {
    chatContent.style.display = "none";
    inputArea.style.display = "none";
    toggleChat.textContent = "▲";
  }
}

// メッセージ送信処理
function sendMessage() {
  const userMessage = userInput.value.trim();
  if (userMessage === "") return;

  // ユーザーメッセージを表示
  displayMessage(userMessage, "user-message");
  userInput.value = "";

  // ボットの応答を表示
  setTimeout(() => {
    const botResponse = getBotResponse(userMessage);
    displayMessage(botResponse, "bot-message");
    chatbox.scrollTop = chatbox.scrollHeight; // スクロールを下に
  }, 500); // 少し遅延を入れて自然な会話感を出す
}

// メッセージ表示関数
function displayMessage(message, className) {
  const messageDiv = document.createElement("div");
  messageDiv.className = className;
  messageDiv.textContent = message;
  chatbox.appendChild(messageDiv);
}

// ボットの応答を生成する関数
function getBotResponse(message) {
  // メッセージを小文字に変換して処理しやすくする
  const lowerMessage = message.toLowerCase();

  // 各種応答パターンをチェック
  if (isGreeting(lowerMessage)) {
    return handleGreeting();
  }

  if (isAboutName(lowerMessage, message)) {
    return handleNameTopic(message);
  }

  if (isAboutMood(lowerMessage)) {
    return handleMoodTopic(lowerMessage);
  }

  if (isGratitude(lowerMessage)) {
    return handleGratitude();
  }

  if (isFarewell(lowerMessage)) {
    return handleFarewell();
  }

  if (isAboutHobbies(lowerMessage)) {
    return handleHobbiesTopic(lowerMessage);
  }

  if (isAboutWeather(lowerMessage)) {
    return handleWeatherTopic(lowerMessage);
  }

  if (isAboutFood(lowerMessage)) {
    return handleFoodTopic(lowerMessage);
  }

  // 前回の話題に関連した応答
  const contextResponse = handleContextBasedResponse(lowerMessage);
  if (contextResponse) {
    return contextResponse;
  }

  // 一般的な質問や会話の継続
  if (isGeneralQuestion(lowerMessage)) {
    return handleGeneralQuestion(lowerMessage);
  }

  // デフォルトの応答
  return getDefaultResponse();
}

// 挨拶かどうかを判定
function isGreeting(lowerMessage) {
  return (
    lowerMessage.includes("こんにちは") ||
    lowerMessage.includes("はじめまして") ||
    lowerMessage.includes("やあ")
  );
}

// 挨拶への応答を処理
function handleGreeting() {
  if (!conversationContext.askedAboutUser) {
    conversationContext.lastTopic = "greeting";
    conversationContext.askedAboutUser = true;
    return "こんにちは！お話できて嬉しいです。お名前を教えていただけますか？";
  } else {
    return "こんにちは！また会えて嬉しいです。何かお手伝いできることはありますか？";
  }
}

// 名前に関する話題かどうかを判定
function isAboutName(lowerMessage, originalMessage) {
  return (
    lowerMessage.includes("名前") ||
    (conversationContext.lastTopic === "greeting" &&
      !conversationContext.userName)
  );
}

// 名前に関する話題への応答を処理
function handleNameTopic(message) {
  const lowerMessage = message.toLowerCase();

  // ユーザーが自分の名前を言った可能性がある場合
  if (
    !lowerMessage.includes("あなた") &&
    !lowerMessage.includes("君") &&
    !lowerMessage.includes("きみ") &&
    !lowerMessage.includes("お前")
  ) {
    // 簡易的な名前抽出
    const nameMatch =
      message.match(/私は(.+)です/) ||
      message.match(/(.+)と言います/) ||
      message.match(/(.+)だよ/);
    if (nameMatch) {
      conversationContext.userName = nameMatch[1];
      conversationContext.lastTopic = "user_info";
      return `${conversationContext.userName}さん、はじめまして！何かお手伝いできることはありますか？`;
    }
  }

  // ボットの名前について聞かれた場合
  conversationContext.lastTopic = "bot_name";
  return "私はAIアシスタントです。あなたのお手伝いをするために存在しています。何かご質問はありますか？";
}

// 気分や調子に関する話題かどうかを判定
function isAboutMood(lowerMessage) {
  return (
    lowerMessage.includes("元気") ||
    lowerMessage.includes("調子") ||
    lowerMessage.includes("気分")
  );
}

// 気分や調子に関する話題への応答を処理
function handleMoodTopic(lowerMessage) {
  conversationContext.lastTopic = "mood";

  if (lowerMessage.includes("？") || lowerMessage.includes("?")) {
    return "私は元気です！AIなので体調は変わりませんが、あなたのお役に立てることが嬉しいです。あなたはどうですか？今日はいい一日を過ごしていますか？";
  } else if (
    lowerMessage.includes("良い") ||
    lowerMessage.includes("いい") ||
    lowerMessage.includes("最高")
  ) {
    return "それは素晴らしいですね！良い気分で一日を過ごせることは大切ですよね。何か楽しいことがあったのですか？";
  } else if (
    lowerMessage.includes("悪い") ||
    lowerMessage.includes("よくない") ||
    lowerMessage.includes("疲れ")
  ) {
    return "そうですか、お疲れのようですね。少しでもリラックスできる時間が取れるといいですね。何かお力になれることはありますか？";
  }

  return "気分や体調についてのお話ですね。健康第一が大切です。何か特定のことでお悩みですか？";
}

// 感謝の言葉かどうかを判定
function isGratitude(lowerMessage) {
  return lowerMessage.includes("ありがとう") || lowerMessage.includes("感謝");
}

// 感謝への応答を処理
function handleGratitude() {
  conversationContext.lastTopic = "gratitude";
  const responses = [
    "どういたしまして！お役に立てて嬉しいです。",
    "お役に立てて光栄です。他にも何かありましたらお気軽にどうぞ。",
    "こちらこそ、お話できて楽しいです。他に何か知りたいことはありますか？",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// 別れの挨拶かどうかを判定
function isFarewell(lowerMessage) {
  return (
    lowerMessage.includes("さようなら") ||
    lowerMessage.includes("バイバイ") ||
    lowerMessage.includes("またね")
  );
}

// 別れの挨拶への応答を処理
function handleFarewell() {
  const userName = conversationContext.userName
    ? `${conversationContext.userName}さん`
    : "";
  return `${userName}さようなら！またいつでも話しかけてくださいね。良い一日をお過ごしください！`;
}

// 趣味に関する話題かどうかを判定
function isAboutHobbies(lowerMessage) {
  return lowerMessage.includes("趣味") || lowerMessage.includes("好き");
}

// 趣味に関する話題への応答を処理
function handleHobbiesTopic(lowerMessage) {
  conversationContext.lastTopic = "hobbies";
  conversationContext.mentionedTopics.push("hobbies");

  if (
    lowerMessage.includes("あなた") ||
    lowerMessage.includes("君") ||
    lowerMessage.includes("きみ") ||
    lowerMessage.includes("お前")
  ) {
    return "私の趣味は会話をすることです！人々の質問に答えたり、情報を提供したりするのが好きです。あなたの趣味は何ですか？";
  } else {
    // ユーザーが自分の趣味について話している可能性
    return "趣味についてのお話ですね！それは素晴らしい趣味だと思います。どのくらいの期間続けているのですか？";
  }
}

// 天気に関する話題かどうかを判定
function isAboutWeather(lowerMessage) {
  return lowerMessage.includes("天気");
}

// 天気に関する話題への応答を処理
function handleWeatherTopic(lowerMessage) {
  conversationContext.lastTopic = "weather";
  conversationContext.mentionedTopics.push("weather");

  if (lowerMessage.includes("今日")) {
    return "今日の天気についてですね。残念ながら、私はリアルタイムの天気情報にアクセスできません。天気予報アプリをご確認いただくことをお勧めします。";
  } else if (lowerMessage.includes("明日")) {
    return "明日の天気予報が気になりますか？残念ながら、私は予報データを持っていません。地域の気象情報をご確認ください。";
  } else if (lowerMessage.includes("雨")) {
    return "雨の日は読書や映画鑑賞など、室内で楽しめることをするのも良いですね。何か特別な予定がありますか？";
  }

  return "天気についてのご質問ですね。具体的にどのような情報をお探しですか？";
}

// 食べ物に関する話題かどうかを判定
function isAboutFood(lowerMessage) {
  return (
    lowerMessage.includes("食べ物") ||
    lowerMessage.includes("料理") ||
    lowerMessage.includes("レストラン") ||
    lowerMessage.includes("美味しい")
  );
}

// 食べ物に関する話題への応答を処理
function handleFoodTopic(lowerMessage) {
  conversationContext.lastTopic = "food";
  conversationContext.mentionedTopics.push("food");

  if (lowerMessage.includes("好き") || lowerMessage.includes("おすすめ")) {
    return "食べ物の好みについてですね。私はAIなので実際に食べることはできませんが、多くの人は和食、イタリアン、中華など様々な料理を楽しんでいます。あなたの好きな料理は何ですか？";
  } else if (
    lowerMessage.includes("作り方") ||
    lowerMessage.includes("レシピ")
  ) {
    return "料理のレシピについてご興味があるのですね。具体的にどんな料理を作りたいですか？簡単なアドバイスならお手伝いできるかもしれません。";
  }

  return "食べ物や料理についてのお話ですね！美味しい食事は人生の楽しみの一つですよね。何か特定の料理について知りたいことはありますか？";
}

// 前回の話題に基づいた応答を処理
function handleContextBasedResponse(lowerMessage) {
  if (conversationContext.lastTopic === "user_info") {
    return "先ほどは自己紹介ありがとうございました。何かお手伝いできることはありますか？";
  } else if (
    conversationContext.lastTopic === "hobbies" &&
    !lowerMessage.includes("趣味")
  ) {
    return "趣味についてもう少し教えてください。それはどのようにして始めたのですか？";
  } else if (
    conversationContext.lastTopic === "food" &&
    !lowerMessage.includes("食べ物")
  ) {
    return "食べ物の話題から少し脱線しましたね。他に何か話したいことはありますか？";
  }

  return null;
}

// 一般的な質問かどうかを判定
function isGeneralQuestion(lowerMessage) {
  return (
    lowerMessage.includes("質問") ||
    lowerMessage.includes("教えて") ||
    lowerMessage.includes("何ができる") ||
    lowerMessage.includes("できること")
  );
}

// 一般的な質問への応答を処理
function handleGeneralQuestion(lowerMessage) {
  if (lowerMessage.includes("質問") || lowerMessage.includes("教えて")) {
    return "もちろん、何について知りたいですか？できる限りお答えします。";
  }

  if (
    lowerMessage.includes("何ができる") ||
    lowerMessage.includes("できること")
  ) {
    return "私は会話をしたり、簡単な質問に答えたり、様々な話題についてお話することができます。例えば、趣味や天気、食べ物などについて話せますよ。何か特定の話題について話しましょうか？";
  }

  return null;
}

// デフォルトの応答を取得
function getDefaultResponse() {
  const defaultResponses = [
    "なるほど、興味深いですね。もう少し詳しく教えていただけますか？",
    "申し訳ありませんが、よく理解できませんでした。別の言い方で教えていただけますか？",
    "その話題について詳しく知りたいです。具体的に何が知りたいですか？",
    "面白い話題ですね！もっと教えてください。",
    "すみません、うまく理解できませんでした。質問の仕方を変えていただけますか？",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// 初期化処理
function initialize() {
  setupEventListeners();

  // 初期メッセージを表示
  setTimeout(() => {
    displayMessage(
      "こんにちは！何かお手伝いできることはありますか？",
      "bot-message"
    );
  }, 1000);
}

// アプリケーションの起動
window.onload = initialize;

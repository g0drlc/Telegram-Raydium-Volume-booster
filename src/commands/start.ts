import TelegramBot from "node-telegram-bot-api";
import { errorLOG } from "../utils/logs";
import { GENERIC_ERROR_MESSAGE } from "../config";

export function startCommand(msg: TelegramBot.Message, bot: TelegramBot) {
    try {
        const chatId = msg.chat.id;

        const text = `👨‍💻 Welcome to Radium Trading Volumn Bot!
        Experience the unique power of Radium Trading Volumn Bot, designed to attract new organic investors.
                        
        Here's How:
        🔄 Volume Generation: Continuous trading volume for 24 hours.
        📦 Package Selection: Various packages tailored to your needs.
        🚀 Multiple Transactions: Adding VolumnBots, you get up to 130tx per minute, each from a unique wallet showcasing new holders.
        🌟 Organic Trending: High transaction rates and volume naturally improve visibility on various crypto platforms.`;

        const content = [
            [
                { text: "✈️ Solana Volume Bot", callback_data: "#" },
            ],
            [
                { text: "🎚️ Target Volume Amount", callback_data: "#" },
            ],
            [
                { text: "💼 Wallets", callback_data: "wallets" },
                { text: "⚙️ Settings", callback_data: "settings" },
            ],
            [
                { text: "🚀 Start", callback_data: "checkWalletBal" },
            ],
            [
                { text: '💰 Gather SOL', callback_data: 'gather_sol' }],
            [
                { text: "🔁 Refresh", callback_data: "refresh" },
                { text: "⏳ Help", callback_data: "help" },
            ],
            [{ text: "❌ Close", callback_data: "close" }],
        ];
        bot.sendPhoto(
            chatId,
            `https://gold-improved-panda-991.mypinata.cloud/ipfs/QmeFasuq7ZxVryi9h9TxWmwwEk9x5shGUTkqKBVPmj6vR7`,
            {
                caption: text,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: content,
                },
            }
        );
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, GENERIC_ERROR_MESSAGE, {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
            },
        });
    }
}

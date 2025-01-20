import "dotenv/config";
import * as mongodb from "mongodb";
import TelegramBot from 'node-telegram-bot-api';
import { errorLOG, informationsLOG, successLOG } from "./utils/logs";
import { startCommand } from "./commands/start";
import { addWalletCallback, genWalletCallback, importWalletCallback, refreshWalletCallback, removeWalletCallback, removeWalletIndexCallback, walletCallback, walletInfoCallback, walletInfoIndexCallback } from "./callbacks/wallets";
import { User } from "./types/user";
import { GENERIC_ERROR_MESSAGE } from "./config";
import { checkBotStatus, checkWalletBal, controlBot, helper, set_to_standard, setBuyIntervalMaxCallback, setBuyIntervalMinCallback, setBuyLowerAmountCallback, setBuyUpperAmountCallback, setDisAmtCallback, setDisWalletNumCallback, setSellAllByTimesCallback, setSlippageCallback, setStanParamsCallback, settingsCallback } from "./callbacks/settings";
import { getBotStatus, startVolumeBooster, stopVolumeBooster } from "./volumebot";
import { gather } from "./volumebot/gather";

const token = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

const mongoUri = process.env.MONGODB_URI as string;
const client = new mongodb.MongoClient(mongoUri);

const dbName = process.env.MONGODB_DB_NAME as string;
const usersCollectionName = process.env.MONGODB_COLLECTION_NAME as string;
const commandList = [
    { command: "start", description: "Start the bot" },
    { command: "wallets", description: "This is to see ur main wallet." },
    { command: "settings", description: "You can change trading parameters." },
];

const now: Date = new Date();
let botName: string;
bot.getMe().then((user) => {
    botName = user.username!.toString();
});
bot.setMyCommands(commandList);

async function getOrCreateUser(
    chatId: number,
    name: string,
    usersCollection: mongodb.Collection
): Promise<User | null> {
    let user = (await usersCollection.findOne({ id: chatId })) as User | null;

    if (!user) {
        await usersCollection.insertOne({
            id: chatId,
            username: name,
            wallets: [],
            tokenAddr: '',  // Default or initial value
            distributionAmount: 0.01,
            buyUpperAmount: 0.002,
            buyLowerAmount: 0.001,
            buyIntervalMax: 2000,
            buyIntervalMin: 1000, // Example value, you can adjust this
            distributionWalletNum: 8,
            sellAllByTimes: 20,
            slippage: 100  // Now allowed because `slippage` is `number` in the interface
        } as User);

        // Fetch the newly inserted user
        user = (await usersCollection.findOne({ id: chatId })) as User | null;
    }

    return user;
}

async function main() {
    try {
        console.log(`${informationsLOG} Connecting to MongoDB...`);
        await client.connect();
        console.log(`${successLOG} Connected to MongoDB...`);
        const db = client.db(dbName);
        const usersCollection = db.collection(usersCollectionName);
        await usersCollection.createIndex({ id: 1 }, { unique: true });

        console.log(`${informationsLOG} Setting up bot...`);

        bot.on("message", async (msg: TelegramBot.Message) => {
            try {
                if (!msg.text) return;

                const chatId = msg.chat.id;
                const name = msg.from?.username!;
                const text = msg.text;

                let user: any;
                switch (text) {
                    case "/start":
                        console.log(
                            msg.from?.username,
                            "start volume bot : ",
                            now.toString()
                        );
                        startCommand(msg, bot);
                        break;
                    case "/wallets":
                        user = await getOrCreateUser(
                            chatId,
                            msg.from?.username!,
                            usersCollection
                        );

                        if (!user) {
                            console.error(`${errorLOG} User not found.`);
                            return;
                        }

                        await walletCallback(user, bot, chatId);
                        break;
                    case "/settings":
                        user = await getOrCreateUser(chatId, name, usersCollection);

                        if (!user) {
                            console.error(`${errorLOG} User not found.`);
                            return;
                        }

                        await settingsCallback(user, bot, chatId);
                        break;
                    // case "/pendingsnipes":
                    //     user = await getOrCreateUser(chatId, name, usersCollection);

                    //     if (!user) {
                    //         console.error(`${errorLOG} User not found.`);
                    //         return;
                    //     }

                    //     await mySnipesCallback(user, bot, chatId);
                    default:
                        break;
                }

                // if (text.startsWith("/")) return;

                // if (text.length !== 34) return;

                // user = await getOrCreateUser(chatId, name, usersCollection);

                // if (!user) {
                //     console.error(`${errorLOG} User not found.`);
                //     return;
                // }

                // await tokenSentCallback(bot, chatId, text);
            } catch (error) {
                const chatId = msg.chat.id;
                console.error(`${errorLOG} ${error}`);
                // bot.sendMessage(chatId, GENERIC_ERROR_MESSAGE, {
                //     reply_markup: {
                //         inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
                //     },
                // });
            }
        });

        bot.on("callback_query", async (callbackQuery) => {
            try {
                const message = callbackQuery.message;

                if (!message) return;

                const chatId = message.chat.id;
                const username = message.chat?.username!;
                const data = callbackQuery.data;

                if (!data) return;

                const user = await getOrCreateUser(chatId, username, usersCollection);

                if (!user) {
                    console.error(`${errorLOG} User not found.`);
                    return;
                }

                if (data.startsWith("remove_wallet_")) {
                    const index = parseInt(data.split("_")[2]);
                    await removeWalletIndexCallback(
                        usersCollection,
                        user,
                        bot,
                        chatId,
                        message,
                        index
                    );
                    bot.answerCallbackQuery(callbackQuery.id);
                    return;
                } else if (data.startsWith("wallet_info_")) {
                    const index = parseInt(data.split("_")[2]);
                    await walletInfoIndexCallback(user, bot, chatId, message, index);
                    bot.answerCallbackQuery(callbackQuery.id);
                    return;
                }

                switch (data) {
                    case "wallets":
                        await walletCallback(user, bot, chatId);
                        break;

                    case "add_wallet":
                        await addWalletCallback(bot, chatId);
                        break;

                    case "import_wallet":
                        await importWalletCallback(
                            usersCollection,
                            user,
                            bot,
                            chatId,
                            message
                        );
                        break;

                    case "generate_wallet":
                        await genWalletCallback(
                            usersCollection,
                            user,
                            bot,
                            chatId,
                            message
                        );
                        break;

                    // case "mypositions":
                    //     await myPositionsCallback(user, bot, chatId);
                    //     break;

                    case "wallet_info":
                        await walletInfoCallback(user, bot, chatId, message);
                        break;

                    case "remove_wallet":
                        await removeWalletCallback(user, bot, chatId, message);
                        break;

                    case "refresh_wallet":
                        await refreshWalletCallback(user, bot, chatId, message);
                        break;

                    // case "mypendingsnipes":
                    //     await mySnipesCallback(user, bot, chatId);
                    //     break;
                    case "setSlippage":
                        await setSlippageCallback(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setDistributionAmt":
                        await setDisAmtCallback(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setDistributionWalletNum":
                        await setDisWalletNumCallback(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setBuyUpperAmount":
                        await setBuyUpperAmountCallback(user, usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setBuyLowerAmount":
                        await setBuyLowerAmountCallback(user, usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setBuyIntervalMax":
                        await setBuyIntervalMaxCallback(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setBuyIntervalMin":
                        await setBuyIntervalMinCallback(user, usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "setSellAllByTimes":
                        await setSellAllByTimesCallback(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "set_standard_params":
                        await setStanParamsCallback(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "set_to_standard":
                        await set_to_standard(usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "checkWalletBal":
                        await checkWalletBal(user, usersCollection, bot, chatId, message);
                        bot.answerCallbackQuery(callbackQuery.id);
                        return;
                    case "settings":
                        await settingsCallback(user, bot, chatId);
                        break;
                    case "start_volume_booster":
                        await controlBot(user, usersCollection, bot, chatId, message);
                        await startVolumeBooster(user);
                        return;
                    case "stop_volume_booster":
                        await stopVolumeBooster();
                        const isRunningBot = await getBotStatus();
                        await checkBotStatus(user, isRunningBot, bot, chatId, message);
                        return;
                    case "gather_sol":
                        await bot.sendMessage(chatId, '💰 Gathering SOL data from sub-wallets... please wait ⏳');
                        await gather(user);
                        await bot.sendMessage(chatId, '✅ Successfully gathered SOL from sub-wallets!');
                    case "help":
                        await helper(chatId, bot);
                    case "close":
                        bot.deleteMessage(chatId, message.message_id);
                        break;
                    default:
                        console.error(`${errorLOG} Unknown command.`);
                        bot.sendMessage(chatId, "Unknown command.", {
                            parse_mode: "Markdown",
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }],
                                ],
                            },
                        });
                }

                bot.answerCallbackQuery(callbackQuery.id);
            } catch (error) {
                if (!callbackQuery.message) return;

                const chatId = callbackQuery.message.chat.id;
                console.error(`${errorLOG} ${error}`);
                bot.sendMessage(chatId, GENERIC_ERROR_MESSAGE, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
                    },
                });
            }
        });
    } catch (error) {

    }
}

main().catch(console.error);
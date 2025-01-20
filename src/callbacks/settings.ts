import TelegramBot from "node-telegram-bot-api";
import { User, Wallet } from "../types/user";
import { errorLOG } from "../utils/logs";
import { getBalance, validatorTokenAddr } from "../utils/utils";
import { PublicKey } from "@solana/web3.js";

export async function settingsCallback(
    user: User,
    bot: TelegramBot,
    chatId: number
) {
    try {
        const wallets = user.wallets as Wallet[];

        const content = `
📊 *Trading Parameters* 📊

💰 *Amount of SOL to distribute to each wallet:* \`${user.distributionAmount} SOL\`
👛 *Number of wallets to distribute SOL to:* \`${user.distributionWalletNum}\`

📈 *Upper amount for buying per transaction:* \`${user.buyUpperAmount} SOL\`
📉 *Lower amount for buying per transaction:* \`${user.buyLowerAmount} SOL\`

⏳ *Maximum interval between buys:* \`${user.buyIntervalMax} ms\`
⏱ *Minimum interval between buys:* \`${user.buyIntervalMin} ms\`

💸 *Sell All By Times:* \`${user.sellAllByTimes} times\`
⚙️ *Slippage:* \`${user.slippage}%\`
`;

        const button = [
            [
                { text: '💸 Set Distribution Amount', callback_data: 'setDistributionAmt' },
                { text: '👛 Set Wallet Number', callback_data: 'setDistributionWalletNum' }
            ],
            [
                { text: '📈 Set Upper Buy Amount', callback_data: 'setBuyUpperAmount' },
                { text: '📉 Set Lower Buy Amount', callback_data: 'setBuyLowerAmount' }
            ],
            [
                { text: '⏳ Set Max Buy Interval', callback_data: 'setBuyIntervalMax' },
                { text: '⏱ Set Min Buy Interval', callback_data: 'setBuyIntervalMin' }
            ],
            [
                { text: '🔄 Set Sell By Times', callback_data: 'setSellAllByTimes' },
                { text: '⚙️ Set Slippage', callback_data: 'setSlippage' }
            ],
            [
                {
                    text: "🛠️ Standard Trading Parameters",
                    callback_data: "set_standard_params"
                }
            ],
            [{
                text: "🔙 Back",
                callback_data: "close",
            }]
        ];


        bot.sendMessage(chatId, content, {
            parse_mode: "Markdown",  // Use Markdown for formatting
            reply_markup: {
                inline_keyboard: button
            },
        });

        return;
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while fetching the wallets.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
            },
        });
    }
}

export async function setStanParamsCallback(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {

        const content = `
📊 *Standard Trading Parameters* 📊

💰 *Amount of SOL to distribute to each wallet:* \`${0.01} SOL\`
👛 *Number of wallets to distribute SOL to:* \`${8}\`

📈 *Upper amount for buying per transaction:* \`${0.002} SOL\`
📉 *Lower amount for buying per transaction:* \`${0.001} SOL\`

⏳ *Maximum interval between buys:* \`${2000} ms\`
⏱ *Minimum interval between buys:* \`${4000} ms\`

💸 *Sell All By Times:* \`${20} times\`
⚙️ *Slippage:* \`${100}%\`
`

        const buttonMarkup = [
            [
                { text: "⚙️ Set to Standard Trading Parameters", callback_data: "set_to_standard" },
                { text: "❌ Cancel", callback_data: "cancel" },
            ],
            [
                { text: "🔙 Back", callback_data: "settings" },
            ],
        ];

        bot.sendMessage(chatId, content, {
            reply_markup: {
                inline_keyboard: buttonMarkup,
            },
            parse_mode: 'Markdown',  // Use MarkdownV2 for better formatting
        });

        return;
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while setting standard tranding parameters.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
            },
        });
    }
}

export async function set_to_standard(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const result = await usersCollection.updateOne(
            { id: chatId }, // Find the user by id
            {
                $set: {
                    distributionAmount: 0.01,
                    distributionWalletNum: 8,
                    buyUpperAmount: 0.002,
                    buyLowerAmount: 0.001,
                    buyIntervalMax: 2000,
                    buyIntervalMin: 4000,
                    sellAllByTimes: 20,
                    slippage: 100
                }
            } // Update the slippage field
        );

        if (result.modifiedCount === 1) {
            console.log(`Successfully updated slippage for user with id ${chatId}`);
            bot.sendMessage(
                chatId,
                `🎉 *Success!* 🎉

Your trading parameters have been successfully set to standard!`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "❌ Close", callback_data: "close" },
                            {
                                text: "🔙 Back",
                                callback_data: "settings",
                            }
                            ],
                        ],
                    },
                }
            );
            return;
        } else {
            console.log(`No updates made. User with id ${chatId} may not exist.`);
            bot.sendMessage(chatId, "No updates made.", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "❌ Close", callback_data: "close" }, {
                            text: "🔙 Back",
                            callback_data: "settings",
                        }],
                    ],
                },
            });
            return;
        }
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing the slippage.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setSlippageCallback(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `Enter the slippage percentage you want to use.`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const slippageText = reply.text;

                    if (!slippageText) {
                        bot.sendMessage(chatId, "Invalid slippage.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const slippage = parseInt(slippageText);

                    if (isNaN(slippage)) {
                        bot.sendMessage(chatId, "Invalid slippage.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    if (slippage < 0 || slippage > 100) {
                        bot.sendMessage(chatId, "Slippage must be between 0 and 100.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { slippage: slippage } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated slippage for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            "Slippage changed successfully to " + slippage + "%",
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing the slippage.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setDisAmtCallback(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
✨ *Let's Distribute Some SOL!* ✨

Please specify the amount of SOL you'd like to allocate to each wallet in your setup. 💼💰
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `🚫 *Invalid SOL Distribution Amount* 🚫

It looks like the amount of SOL you entered is not valid.Please double - check and try again. 💡`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseFloat(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    console.log("upddddddddate", update)
                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { distributionAmount: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            "Amount of SOL to distribute to each wallet changed successfully to " + update,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing amount of SOL to distribute to each wallet.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setDisWalletNumCallback(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
💼 *Volume Boosting* 💼

Please enter the number of wallets you would like to use for volume boosting. This will help distribute the SOL effectively. 🔢
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `
⚠️ *Invalid Wallet Number* ⚠️

The number you entered is not valid. Please input a valid number of wallets for volume boosting. Ensure it's a positive number. 🔢
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseInt(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { distributionWalletNum: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            "Number of wallets to distribute SOL changed successfully to " + update,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing Number of wallets to distribute SOL .", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setBuyUpperAmountCallback(
    user: User,
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
📈 *Upper Amount for Buying* 📈

Please specify the maximum amount of SOL you wish to spend on each transaction. This will help set your buying limits effectively. 💰
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `
⚠️ *Invalid Upper Amount for Buying* ⚠️

The number you entered is not valid. Please input a valid upper Amount for Buying for volume boosting. Ensure it's a positive number. 🔢
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseFloat(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    if (update > user.distributionAmount) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Amount* 🚫

The upper amount for buying cannot exceed the balance of each wallet. Please enter a valid amount that is within your wallet's balance. 💳
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });

                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { buyUpperAmount: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            `✅ *Success!* ✅

The upper amount for buying has been successfully updated to` + update,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing Number of wallets to distribute SOL .", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setBuyLowerAmountCallback(
    user: User,
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
📈 *Lower Amount for Buying* 📈

Please specify the maximum amount of SOL you wish to spend on each transaction. This will help set your buying limits effectively. 💰
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `
⚠️ *Invalid Lower Amount for Buying* ⚠️

The number you entered is not valid. Please input a valid Lower Amount for Buying for volume boosting. Ensure it's a positive number. 🔢
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseFloat(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    if (update > user.distributionAmount) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Amount* 🚫

The Lower amount for buying cannot exceed the balance of each wallet. Please enter a valid amount that is within your wallet's balance. 💳
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });

                        return;
                    }

                    if (update > user.buyUpperAmount) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Amount* 🚫

The Lower amount for buying cannot exceed The maximum amount for buying. Please enter a valid amount that is lower than maximum for buying. 💳
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });

                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { buyLowerAmount: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            `✅ *Success!* ✅

The upper amount for buying has been successfully updated to` + update,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing Number of wallets to distribute SOL .", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setBuyIntervalMaxCallback(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
⏳ *Maximum Interval Between Buys* ⏳

Please enter the maximum interval (in milliseconds) that you would like between consecutive buy transactions. This will help optimize your trading strategy! ⏱️
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Interval* 🚫

The maximum interval between buys you entered is not valid. Please enter a positive number in milliseconds. Ensure it’s within a reasonable range! ⏱️
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseInt(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { buyIntervalMax: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            "Maximum interval between buys changed successfully to " + update,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing Maximum interval between buys: .", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setBuyIntervalMinCallback(
    user: User,
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
⏱️ *Minimum Interval Between Buys* ⏱️

Please specify the minimum interval (in milliseconds) that you would like to have between consecutive buy transactions. This will help ensure smoother trading operations! ⏳
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Minimum Interval* 🚫

The minimum interval between buys you entered is not valid. Please provide a positive number in milliseconds. Ensure it’s within a reasonable range! ⏱️
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseInt(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }


                    if (update < user.buyIntervalMax) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Interval Configuration* 🚫

The minimum interval between buys cannot be greater than the maximum interval. Please ensure the minimum interval is less than or equal to the maximum interval! ⏱️⏳
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });

                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { buyIntervalMin: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            `✅ *Success!* ✅

Minimum interval between buys has been successfully updated to ` + update + " ms",
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing Minimum interval between buys .", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function setSellAllByTimesCallback(
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const text = `
💸 *Sell All By Times* 💸

Please specify how many times you would like to sell all your assets in each transaction cycle. This will help you manage your trading strategy effectively! 🔄
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const updateText = reply.text;

                    if (!updateText) {
                        bot.sendMessage(chatId, `
🚫 *Invalid Sell All By Times* 🚫

The value you entered for "Sell All By Times" is not valid. Please enter a positive integer that represents how many times you wish to sell all your assets in each transaction cycle. 💸
`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const update = parseInt(updateText);

                    if (isNaN(update)) {
                        bot.sendMessage(chatId, `🚫 *Invalid Input* 🚫

The value you entered contains letters or characters that are not numbers. Please enter a valid numeric amount. 🔢`, {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const result = await usersCollection.updateOne(
                        { id: chatId }, // Find the user by id
                        { $set: { sellAllByTimes: update } } // Update the slippage field
                    );

                    if (result.modifiedCount === 1) {
                        console.log(`Successfully updated for user with id ${chatId}`);
                        bot.sendMessage(
                            chatId,
                            "Sell All By Times changed successfully to " + update,
                            {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" },
                                        {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }
                                        ],
                                    ],
                                },
                            }
                        );
                        return;
                    } else {
                        console.log(`No updates made. User with id ${chatId} may not exist.`);
                        bot.sendMessage(chatId, "No updates made.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" }, {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }],
                                ],
                            },
                        });
                        return;
                    }


                });
            });
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while changing Sell All By Times.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function checkWalletBal(
    user: User,
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        //console.log("Feeeeeeeeee", !user.wallets[0].publicKey)
        if (!user.wallets || user.wallets.length === 0 || !user.wallets[0].publicKey) {
            bot.sendMessage(chatId, `⚠️ *Notice:* ⚠️

It seems there are currently no treasury wallet available. 

💼 *Action Required:*  
You will need to create new wallet to proceed with your trading operations.

🛠️ *To create new wallet, please follow the prompts below or use the command to initiate the wallet creation process.*

🔄 *Let’s get you set up!* 🔄
`, {
                reply_markup: {
                    inline_keyboard: [[
                        {
                            text: "➕ Create New Wallet",
                            callback_data: "add_wallet",
                        },
                    ], [{ text: "❌ Close", callback_data: "close" }, {
                        text: "🔙 Back",
                        callback_data: "close",
                    }]],
                },
            });
        }
        const publicKeyObj = new PublicKey(user.wallets[0].publicKey); // Convert string to PublicKey object
        const userWalletBal = await getBalance(publicKeyObj);

        const solAmtForTrading = user.distributionAmount * user.distributionWalletNum + 0.01;

        if (userWalletBal < solAmtForTrading + 0.01) {
            const add = solAmtForTrading - userWalletBal;
            const text = `
💰 *Treasury Wallet Balance Alert* 💰

Your current treasury wallet balance is \`${userWalletBal.toFixed(4)} SOL\`.

In order to distribute SOL to your sub-wallets, you need a minimum balance of \`${solAmtForTrading.toFixed(4)} SOL\`.

Please fund an additional \`${add.toFixed(4)} SOL \` into your treasury wallet to proceed.

👉 Here’s your wallet address: \`${user.wallets[0].publicKey} \`.

Thank you for your attention! If you have any questions or need assistance, feel free to reach out. 😊
`;
            const buttonMarkup = [
                [
                    { text: "❌ Cancel", callback_data: "cancel" },
                    { text: "🔙 Back", callback_data: "settings" },
                ],
            ];
            bot.sendMessage(chatId, text, {
                reply_markup: {
                    inline_keyboard: buttonMarkup,
                },
                parse_mode: 'Markdown',  // Use MarkdownV2 for better formatting
            });
        }

        const text = `
🔗 *Enter Token Address for Volume Booster* 🔗

Please provide the token address you would like to use for the volume booster. Make sure the address is valid!

💬 Enter the token address below:
`;

        bot
            .sendMessage(chatId, text, {
                reply_markup: {
                    force_reply: true,
                },
                parse_mode: 'Markdown'
            })
            .then((msg) => {
                bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                    const tokenAddr = reply.text;

                    if (!tokenAddr) {
                        bot.sendMessage(chatId, "Invalid Token address.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                    const isToken = validatorTokenAddr(tokenAddr);
                    if (isToken) {
                        const result = await usersCollection.updateOne(
                            { id: chatId }, // Find the user by id
                            { $set: { tokenAddr: tokenAddr } } // Update the slippage field
                        );
                        if (result.modifiedCount === 1 || tokenAddr === user.tokenAddr) {

                            const publicKeyObj = new PublicKey(user.wallets[0].publicKey); // Convert string to PublicKey object
                            const userWalletBal = await getBalance(publicKeyObj);

                            console.log(`Successfully updated for user with id ${chatId}`);
                            const text = `
🔗 *Token Address:* \`${tokenAddr}\`

💳 *Your Deposit Wallet:*
\`${user.wallets[0].publicKey}\`
💰 *Balance:* \`${userWalletBal} SOL\`

🔧 *Trading Parameters:*

💰 *Amount of SOL to distribute to each wallet:* \`${user.distributionAmount} SOL\`
👛 *Number of wallets to distribute SOL to:* \`${user.distributionWalletNum}\`

📈 *Upper amount for buying per transaction:* \`${user.buyUpperAmount} SOL\`
📉 *Lower amount for buying per transaction:* \`${user.buyLowerAmount} SOL\`

⏳ *Maximum interval between buys:* \`${user.buyIntervalMax} ms\`
⏱ *Minimum interval between buys:* \`${user.buyIntervalMin} ms\`

💸 *Sell All By Times:* \`${user.sellAllByTimes} times\`
⚙️ *Slippage:* \`${user.slippage}%\`
`;
                            const button = [
                                [
                                    {
                                        text: "🔄 Start",
                                        callback_data: "start_volume_booster",
                                    },
                                ],
                                [{ text: "❌ Close", callback_data: "close" }, {
                                    text: "🔙 Back",
                                    callback_data: "close",
                                }],
                            ];

                            bot.sendMessage(chatId, text, {
                                reply_markup: {
                                    inline_keyboard: button,
                                },
                                parse_mode: 'Markdown',  // Use MarkdownV2 for better formatting
                            });

                        } else {
                            console.log(`No updates made. User with id ${chatId} may not exist.`);
                            bot.sendMessage(chatId, "No updates made.", {
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: "❌ Close", callback_data: "close" }, {
                                            text: "🔙 Back",
                                            callback_data: "settings",
                                        }],
                                    ],
                                },
                            });
                            return;
                        }


                    } else {
                        bot.sendMessage(chatId, "Invalid Token address.", {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "❌ Close", callback_data: "close" },
                                    {
                                        text: "🔙 Back",
                                        callback_data: "settings",
                                    }
                                    ],
                                ],
                            },
                        });
                        return;
                    }

                });
            });



    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while inputing token address.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function controlBot(
    user: User,
    usersCollection: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message
) {
    try {
        const tokenPair = "";
        const text = `
🚀 *Volume Bot is Now Active!*  
🔍 Check the live results on *DexScreener* or manage the bot below:  

⚠️ If you want to stop the bot, press the "Stop Bot" button.  
`
        const buttonMarkup = [
            [
                { text: '📊 View DexScreener 📊', url: `https://dexscreener.com` }
            ],
            [
                { text: '⏹️ Stop Bot ⏹️', callback_data: 'stop_volume_booster' }
            ]
        ];
        bot.sendMessage(chatId, text, {
            reply_markup: {
                inline_keyboard: buttonMarkup,
            },
            parse_mode: 'Markdown',  // Use MarkdownV2 for better formatting
        });

    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while stopping bot.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function checkBotStatus(user: User,
    isRunning: any,
    bot: TelegramBot,
    chatId: number,
    message: TelegramBot.Message) {
    try {
        if (isRunning) {
            const text = `
🛑 *Bot Stopped Successfully* 🛑

The volume booster bot has been *shut down* gracefully. All operations are now halted. 🔻

Feel free to restart when you're ready for more action! 🚀

If you need any help or have questions, we're here to assist you! 😊
`;

            bot.sendMessage(chatId, text, {
                parse_mode: "Markdown",
            });

            return;
        }
    } catch (error) {
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, "An error occurred while stopping bot.", {
            reply_markup: {
                inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }, {
                    text: "🔙 Back",
                    callback_data: "settings",
                }]],
            },
        });
    }
}

export async function helper(
    chatId: number, bot: TelegramBot) {
    const helpMessage = `
🔍 *Raydium Volume Bot Help* 📘

This bot is designed to help you track and manage your Raydium volume and Solana wallets. Here's a guide to using the bot:

✈️ *Solana Volume Bot*: Displays the bot's title and purpose.

🎚️ *Target Volume Amount*: Set your target Raydium volume. This helps you track how close you are to achieving your target.

💼 *Wallets*: Manage your Solana wallets. You can view and track the balances of multiple sub-wallets.

⚙️ *Settings*: Customize the bot's settings, such as notifications, volume thresholds, or other preferences.

🚀 *Start*: Start checking your wallet balances and calculating your Raydium volume across the wallets.

💰 *Gather SOL*: Gather all available SOL from your connected sub-wallets into a single main wallet.

🔁 *Refresh*: Refresh your wallet balances and Raydium volume data.

⏳ *Help*: Displays this help message to guide you through using the bot.

❌ *Close*: Close the bot's interaction menu.

If you have any further questions or need support, feel free to contact us.
`;
    const button = [[{ text: "❌ Close", callback_data: "close" }]]
    bot.sendMessage(chatId, helpMessage, {
        reply_markup: {
            inline_keyboard: button,
        },
        parse_mode: 'Markdown',  // Use MarkdownV2 for better formatting
    });

}
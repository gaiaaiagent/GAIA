import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger,
} from "@elizaos/core";
import * as fs from "fs";
import * as path from "path";
import Arweave from "arweave";

export const arweaveSetupAction: Action = {
    name: "ARWEAVE_SETUP",
    similes: ["SETUP_ARWEAVE", "CREATE_ARWEAVE_WALLET", "CONFIGURE_ARWEAVE"],
    description: "Generate a new Arweave wallet using the SDK and save it to disk.",
    validate: async () => true,
    handler: async (
        _runtime: IAgentRuntime,
        _message: Memory,
        _state: State,
        _options: any,
        callback?: HandlerCallback
    ) => {
        try {
            // Always use agent/.arweave as wallet path
            const walletDir = path.resolve(".arweave");
            const walletPath = path.join(walletDir, "wallet.json");

            const arweave = Arweave.init({
                host: "arweave.net",
                port: 443,
                protocol: "https",
            });

            if (fs.existsSync(walletPath)) {
                const existingWallet = JSON.parse(fs.readFileSync(walletPath, "utf8"));
                const address = await arweave.wallets.jwkToAddress(existingWallet);
                const balanceWinston = await arweave.wallets.getBalance(address);
                const balanceAR = arweave.ar.winstonToAr(balanceWinston);

                const message = `🔐 Existing Arweave wallet detected:

**Address**: \`${address}\`
**Balance**: \`${balanceAR} AR\`
**Path**: \`${walletPath}\`

Setup aborted to avoid overwriting.`;

                elizaLogger.warn(message);
                if (callback) {
                    callback({
                        text: message,
                        metadata: { walletPath, address, balance: balanceAR },
                    });
                }
                return false;
            }

            if (!fs.existsSync(walletDir)) fs.mkdirSync(walletDir, { recursive: true });

            elizaLogger.info("Generating new Arweave key...");
            const key = await arweave.wallets.generate();
            fs.writeFileSync(walletPath, JSON.stringify(key, null, 2));
            elizaLogger.info(`Saved Arweave wallet to ${walletPath}`);

            const address = await arweave.wallets.jwkToAddress(key);

            const envPath = path.resolve(".env");
            let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
            const newEnvLine = `ARWEAVE_WALLET_PATH=${path.resolve(walletPath)}`;
            elizaLogger.info(`Using wallet path: ${process.env.ARWEAVE_WALLET_PATH}`);
            if (!env.includes("ARWEAVE_WALLET_PATH")) {
                env += `\n${newEnvLine}`;
            } else {
                env = env.replace(/^ARWEAVE_WALLET_PATH=.*$/m, newEnvLine);
            }
            fs.writeFileSync(envPath, env);

            if (callback) {
                callback({
                    text: `✅ Arweave wallet created!

**Address**: \`${address}\`
**Path**: \`${walletPath}\`

Stored in .env as \`ARWEAVE_WALLET_PATH\`.

👉 Fund it at https://faucet.arweave.net (or using real AR).`,
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Failed to generate wallet:", error);
            if (callback) {
                callback({
                    text: `❌ Error setting up Arweave wallet: ${error.message}`,
                    error: true,
                });
            }
            return false;
        }
    },
    examples: [
        [
            { user: "{{user1}}", content: { text: "Setup Arweave" } },
            { user: "{{agentName}}", content: { text: "{{responseData}}", action: "ARWEAVE_SETUP" } },
        ],
    ],
};

export default arweaveSetupAction;

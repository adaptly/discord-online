const os = require('os');
const axios = require('axios');
const WebSocket = require('ws');
const keepAlive = require('./keep_alive');

const status = "dnd"; // online/dnd/idle

const customStatus = "bored"; // If you don't need a custom status on your profile, just put ""

const usertoken = process.env.TOKEN;
if (!usertoken) {
    console.error("[ERROR] Please add a token inside Secrets.");
    process.exit();
}

const headers = { "Authorization": usertoken, "Content-Type": "application/json" };

axios.get("https://canary.discordapp.com/api/v9/users/@me", { headers })
    .then(response => {
        const userinfo = response.data;
        const username = userinfo.username;
        const discriminator = userinfo.discriminator;
        const userid = userinfo.id;

        function onliner(token, status) {
            const ws = new WebSocket("wss://gateway.discord.gg/?v=9&encoding=json");
            ws.on('open', () => {
                ws.on('message', (data) => {
                    const start = JSON.parse(data);
                    const heartbeat = start.d.heartbeat_interval;
                    const auth = {
                        op: 2,
                        d: {
                            token: token,
                            properties: {
                                $os: "Windows 10",
                                $browser: "Google Chrome",
                                $device: "Windows",
                            },
                            presence: { status: status, afk: false },
                        },
                        s: null,
                        t: null,
                    };
                    ws.send(JSON.stringify(auth));
                    const cstatus = {
                        op: 3,
                        d: {
                            since: 0,
                            activities: [
                                {
                                    type: 4,
                                    state: customStatus,
                                    name: "Custom Status",
                                    id: "custom",
                                    // Uncomment the below lines if you want an emoji in the status
                                    // emoji: {
                                    //     name: "emoji name",
                                    //     id: "emoji id",
                                    //     animated: false,
                                    // },
                                }
                            ],
                            status: status,
                            afk: false,
                        },
                    };
                    ws.send(JSON.stringify(cstatus));
                    const online = { op: 1, d: "None" };
                    setTimeout(() => {
                        ws.send(JSON.stringify(online));
                    }, heartbeat);
                });
            });
        }

        function runOnliner() {
            console.clear();
            console.log(`Logged in as ${username}#${discriminator} (${userid}).`);
            setInterval(() => {
                onliner(usertoken, status);
            }, 50000);
        }

        keepAlive();
        runOnliner();
    })
    .catch(error => {
        console.error("[ERROR] Your token might be invalid. Please check it again.");
        process.exit();
    });

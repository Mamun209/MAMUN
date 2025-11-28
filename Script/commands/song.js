const axios = require("axios");
const fs = require('fs');

// 🔰
const baseApiUrl = async () => {
  try {
    const raw = await axios.get(
      "https://raw.githubusercontent.com/Xx-Rahat-xX/Xx_Rahat_Xx/main/Config.json"
    );

    const apiList = raw.data?.si_Xx_Rahat_Xx_Api;

    if (!apiList || !Array.isArray(apiList) || apiList.length === 0) {
      throw new Error("❌Api ই ডিলিট করে দিছে🤦\n গান কীভাবে দিবো🤣");
    }

    for (const api of apiList) {
      try {
        await axios.get(api + "/status").catch(() => {});
        return api;  
      } catch (e) {
        continue;
      }
    }

    throw new Error("❌API নষ্ট হয়ে গেছে🥹\n একটু বসকে খবর দাও ঠিক করে দিবে");

  } catch (err) {
    console.log("BASE API ERROR:", err.message);
    throw new Error("❌ JSON লোড ব্যর্থ!");
  }
};

module.exports.config = {
  name: "song",
  version: "2.1.0",
  aliases: ["music", "play"],
  credits: "🔰Rahat_Islam🔰",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube",
  commandCategory: "media",
  usages: "{pn} [<song name>|<song link>]:" + "\n   Example:" + "\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async ({ api, args, event, commandName, message }) => {

  // 🔰 
  const animationFrames = [
    "🟢𝗕𝗼𝘁 𝗶𝘀 𝘀𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗮𝘂𝗱𝗶𝗼..",
    "🟡𝗕𝗼𝘁 𝗶𝘀 𝘀𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗮𝘂𝗱𝗶𝗼....",
    "🔴𝗕𝗼𝘁 𝗶𝘀 𝘀𝗲𝗮𝗿𝗰𝗵𝗶𝗻𝗴 𝗮𝘂𝗱𝗶𝗼.....",
    "⚪𝗕𝗼𝘁 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝘀𝗼𝗻𝗴 𝗱𝗮𝘁𝗮......",
    "🟣𝗕𝗼𝘁 𝗮𝗻𝗮𝗹𝘆𝘇𝗶𝗻𝗴 𝗿𝗲𝘀𝘂𝗹𝘁𝘀...........",
    "🟢𝗕𝗼𝘁 𝗯𝘂𝗳𝗳𝗲𝗿𝗶𝗻𝗴 𝗯𝗲𝗮𝘁𝘀................",
    "🔴𝗕𝗼𝘁 𝗳𝗶𝗻𝗱𝗶𝗻𝗴 𝗿𝗵𝘆𝘁𝗵𝗺...................",
    "⚫𝗕𝗼𝘁 𝘁𝘂𝗻𝗶𝗻𝗴 𝘁𝗵𝗲 𝘀𝗼𝘂𝗻𝗱.................",
    "🟡𝗕𝗼𝘁 𝗺𝗶𝘅𝗶𝗻𝗴 𝘃𝗼𝗰𝗮𝗹𝘀.........................",
    "🟢𝗕𝗼𝘁 𝗰𝗵𝗲𝗰𝗸𝗶𝗻𝗴 𝗾𝘂𝗮𝗹𝗶𝘁𝘆......................"
  ];

  let frameIndex = 0;
  const animMsg = await api.sendMessage(animationFrames[0], event.threadID);
  const animInterval = setInterval(() => {
    frameIndex = (frameIndex + 1) % animationFrames.length;
    api.editMessage(animationFrames[frameIndex], animMsg.messageID);
  }, 200);

  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;

  let videoID;
  const urlYtb = checkurl.test(args[0]);

  try {
    // 🔰 Direct link হলে
    if (urlYtb) {
      const match = args[0].match(checkurl);
      videoID = match ? match[1] : null;

      const { data: { title, downloadLink } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
      );

      clearInterval(animInterval);
      await api.unsendMessage(animMsg.messageID);

      return api.sendMessage({
        body: title,
        attachment: await dipto(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
    }

    // 🔰 Keyword search
    let keyWord = args.join(" ");
    keyWord = keyWord.includes("?feature=share") ? keyWord.replace("?feature=share", "") : keyWord;

    const maxResults = 6;
    let result;

    try {
      result = (
        (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${keyWord}`)).data
      ).slice(0, maxResults);

    } catch (err) {
      clearInterval(animInterval);
      await api.unsendMessage(animMsg.messageID);
      return api.sendMessage("❌ An error occurred:" + err.message, event.threadID);
    }

    if (result.length == 0) {
      clearInterval(animInterval);
      await api.unsendMessage(animMsg.messageID);
      return api.sendMessage("⭕ সার্চ কী তোর নানি দিবো: " + keyWord, event.threadID);
    }

    let msg = "";
    let i = 1;
    const thumbnails = [];

    for (const info of result) {
      thumbnails.push(diptoSt(info.thumbnail, 'photo.jpg'));
      msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
    }

    clearInterval(animInterval);
    await api.unsendMessage(animMsg.messageID);

    api.sendMessage({
      body: msg + "Reply to this message with a number want to listen",
      attachment: await Promise.all(thumbnails)
    }, event.threadID, (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        result
      });
    });

  } catch (error) {
    clearInterval(animInterval);
    await api.unsendMessage(animMsg.messageID);
    api.sendMessage("⭕ Error while processing audio.", event.threadID);
  }
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);

    if (!isNaN(choice) && choice <= result.length && choice > 0) {

      const infoChoice = result[choice - 1];
      const idvideo = infoChoice.id;

      const animationFrames = [
        "🟢𝗕𝗼𝘁 𝗮𝗹𝗺𝗼𝘀𝘁 𝘁𝗵𝗲𝗿𝗲...",
        "🟣𝗕𝗼𝘁 𝗲𝗻𝗰𝗼𝗱𝗶𝗻𝗴 𝗠𝗣𝟯...",
        "🟠𝗕𝗼𝘁 𝗿𝗲𝗺𝗼𝘃𝗶𝗻𝗴 𝗻𝗼𝗶𝘀𝗲....",
        "⚪𝗕𝗼𝘁 𝗳𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗠𝗣𝟯 𝗳𝗶𝗹𝗲...",
        "🔴𝗕𝗼𝘁 𝗲𝗾𝘂𝗮𝗹𝗶𝘇𝗶𝗻𝗴 𝘀𝗼𝘂𝗻𝗱....",
        "🟢𝗕𝗼𝘁 𝗰𝗼𝗺𝗽𝗿𝗲𝘀𝘀𝗶𝗻𝗴 𝗳𝗶𝗹𝗲.......",
        "🔵𝗕𝗼𝘁 𝗲𝗻𝗵𝗮𝗻𝗰𝗶𝗻𝗴 𝗯𝗮𝘀𝘀..........",
        "🔴𝗕𝗼𝘁 𝗲𝗾𝘂𝗮𝗹𝗶𝘇𝗶𝗻𝗴 𝘀𝗼𝘂𝗻𝗱.........",
        "🟠𝗕𝗼𝘁 𝗿𝗲𝗺𝗼𝘃𝗶𝗻𝗴 𝗻𝗼𝗶𝘀𝗲..............",
        "🟢𝗕𝗼𝘁 𝗰𝗼𝗺𝗽𝗿𝗲𝘀𝘀𝗶𝗻𝗴 𝗳𝗶𝗹𝗲.............",
        "🔵𝗕𝗼𝘁 𝗲𝗻𝗰𝗼𝗱𝗶𝗻𝗴 𝗠𝗣𝟯..........."
      ];

      let frameIndex = 0;
      const animMsg = await api.sendMessage(animationFrames[0], event.threadID);
      const animInterval = setInterval(() => {
        frameIndex = (frameIndex + 1) % animationFrames.length;
        api.editMessage(animationFrames[frameIndex], animMsg.messageID);
      }, 200);

      const { data: { title, downloadLink, quality } } = await axios.get(
        `${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`
      );

      clearInterval(animInterval);
      await api.unsendMessage(animMsg.messageID);
      await api.unsendMessage(handleReply.messageID);

      await api.sendMessage({
        body: `🔰Title: ${title}\n🔰 Quality: ${quality}`,
        attachment: await dipto(downloadLink, 'audio.mp3')
      }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);

    } else {
      api.sendMessage("Invalid choice. Please enter a number between 1 and 6.", event.threadID);
    }

  } catch (error) {
    api.sendMessage("⭕Sorry, audio size was less than 26MB", event.threadID);
  }
};

async function dipto(url, pathName) {
  try {
    const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}

async function diptoSt(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
  } catch (err) {
    throw err;
  }
}

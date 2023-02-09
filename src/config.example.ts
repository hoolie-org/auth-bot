export default {
  BOT_TOKEN: "",

  DB: {
    URL: "mongodb://127.0.0.1:27017",
    NAME: "tg-bot-scaffold"
  },

  REDIS: {
    DB: 1
  },

  WEBHOOK: {
    isEnabled: false, // If false, long polling will be used to get bot updates
    PORT: 3001,
    HOST: "127.0.0.1",
    ENDPOINT: "https://example.com"
  },

  AVATARS_DIRECTORY: "avatars"
};

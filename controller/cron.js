const { CronJob } = require("cron");
const axios = require("axios");

new CronJob(
  "*/60 * * * * *",
  async function () {
    await axios
      .get("http://localhost:3000/api/products")
      .then((res) => console.log(res))
      .catch((e) => console.log(e));
    await axios
      .get("http://localhost:3000/api/mailing")
      .then((res) => console.log(res))
      .catch((e) => console.log(e));
  },
  null,
  true,
  "Europe/Warsaw",
);

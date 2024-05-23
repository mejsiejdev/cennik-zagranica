const axios = require("axios");

const cronJob = async () => {
  await axios
    .get("/api/products")
    .then((res) => console.log(res))
    .catch((e) => console.log(e));
  await axios
    .get("/api/mailing")
    .then((res) => console.log(res))
    .catch((e) => console.log(e));
};

cronJob();

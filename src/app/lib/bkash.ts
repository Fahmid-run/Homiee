import { configs } from "../config";

export const getGrandToken = async () => {
  const res = await fetch(
    `${configs.bkash_baseUrl}/tokenized/checkout/token/grant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        username: configs.bkash_username,
        password: configs.bkash_password,
      },
      body: JSON.stringify({
        app_key: configs.bkash_app_key,
        app_secret: configs.bkash_app_secret,
      }),
    },
  );

  const result = res.json();
  return result;
};

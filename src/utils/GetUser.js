import axios from "axios";

export default async function GetUser(token) {
  let response;

  try {
    response = await axios({
      url: `${process.env.KHULKE_USER_ONBOARDING_URL}/v1/user`,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      return response.data.data[0];
    }
  } catch (e) {
    try {
      response = await axios({
        url: `${process.env.KHULKE_USER_ONBOARDING_URL}/v1/user/anonymous`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status !== 200) {
        throw new Error("Something went wrong 1");
      }

      return response.data.data[0];
    } catch (e) {
      throw new Error("Something went wrong 2");
    }
  }
}

import axios from "axios";

/**
 * Pulls current running application specs from Flux API
 * @returns {Promise<Array>} A promise that resolves to an array of apps owned by appOwner.
 * @error If an error occurs or no apps are found, an empty array is returned.
 */
async function getGlobalApps(appOwner) {
  try {
    const response = await axios.get("https://api.runonflux.io/apps/globalappsspecifications");
    const apps = response.data.data;
    const ownerAppData = apps.filter((app) => app?.owner === appOwner);
    return ownerAppData;
  } catch (error) {
    console.log(error);
    return [];
  }
}

/**
 *
 * @returns {Promise<number>} A promise that resolves to the current blockHeight of Flux network
 * @error If an error occurs then 0 is returned
 */
async function getCurrentBlockHeight() {
  try {
    const response = await axios.get("https://api.runonflux.io/daemon/getinfo");
    return response.data?.data?.blocks;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export { getGlobalApps, getCurrentBlockHeight };

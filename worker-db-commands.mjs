import fetch from 'node-fetch';
import dotenv from 'dotenv';
const ENV = dotenv.config();
const devWorkerUrl = `http://127.0.0.1:8787`;
const prodWorkerUrl = ENV.WORKER_URL;

const nodeArgs = process.argv.slice(2);

const endpointUrl = nodeArgs[0] === 'prod' ? prodWorkerUrl : devWorkerUrl;

const PRESHARED_AUTH_HEADER_KEY = 'X-Send-PSK';

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json',
      [PRESHARED_AUTH_HEADER_KEY]: ENV.ADMIN_TOKEN,
    },
    body: JSON.stringify(data),
  });
  return response.text();
}

async function getData(url = '') {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

const addWholeDBFn = async () => {
  const { default: data } = await import('./db/nft.mjs');
  await postData(`${endpointUrl}/add-db`, data);
};

const addDbFn = async () => {
  const { default: data } = await import('./db/nft.mjs');
  const dataMutable = [...data];
  for (const _ of dataMutable) {
    const arr = [];
    for (let i = 0; i < 5; i++) {
      dataMutable.length && arr.push(dataMutable.pop());
    }
    await postData(`${endpointUrl}/add-db-five`, arr);
  }
};

const testGetAssetFn = async () => {
  const getReq = await getData(`${endpointUrl}/get-asset/95d6681c7c2385b75d6b76ee1ca5`);
  console.log(await getReq);
};

(async _ => {
  testGetAssetFn();
})();

import fetch from 'node-fetch';
import dotenv from 'dotenv';
const ENV = dotenv.config();
const devWorkerUrl = `http://127.0.0.1:8787`;
const prodWorkerUrl = ENV.parsed.WORKER_URL;

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
      [PRESHARED_AUTH_HEADER_KEY]: ENV.parsed.ADMIN_TOKEN,
    },
    body: JSON.stringify(data),
  });
  return response;
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
  return response;
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

const addDBasset = async asset => {
  const data = JSON.stringify(asset);
  await postData(`${endpointUrl}/add-db-asset`, data);
};

const testGetAssetFn = async assetId => {
  const getReq = await getData(`${endpointUrl}/get-asset/${assetId}`);
  return getReq;
};

const testGetDBtFn = async () => {
  const getReq = await getData(`${endpointUrl}/get-db`);
  return getReq;
};

const testAndAddDBassetFn = async () => {
  const { default: data } = await import('./db/nft.mjs');

  for (const el of data) {
    if (!(await testGetAssetFn(el.id)).ok) {
      await addDBasset(el);
      console.log(`Added asset ${el.id}`);
    }
  }
};

const testOverwiteAllAssets = async () => {
  const { default: data } = await import('./db/nft.mjs');

  for (const el of data) {
    await addDBasset(el);
    console.log(`Overwritten asset ${el.id}`);
  }
};

(async _ => {
  await testOverwiteAllAssets();
})();

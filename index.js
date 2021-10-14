const PRESHARED_AUTH_HEADER_KEY = 'X-Send-PSK';
const PRESHARED_AUTH_HEADER_VALUE = ADMIN_TOKEN;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  Allow: 'GET, HEAD, POST, OPTIONS',
};

requireAuth = async request => {
  const { headers } = request;
  const authHeader = headers[PRESHARED_AUTH_HEADER_KEY];
  if (authHeader !== PRESHARED_AUTH_HEADER_VALUE) {
    return new Response('Unauthorized', { status: 401 });
  }
};

const getAsset = async assetId => {
  const asset = await nft.get(assetId);
  if (asset === null) {
    return new Response('Asset not found', { status: 404 });
  }
  return new Response(JSON.stringify(asset), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
};

const getDB = async _ => {
  const resource = await nft.get('nftdb');
  if (asset === null) {
    return new Response('Resource not found', { status: 404 });
  }
  return new Response(JSON.stringify(resource), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
};

const addDb = async request => {
  requireAuth(request);
  const data = await request.json();
  nft.put('nftdb', JSON.stringify(data));
  return new Response(JSON.stringify({ ok: 'ok' }), {
    status: 201, // Created
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const addDbFiveAtATime = async request => {
  requireAuth(request);
  const data = await request.json();
  for (const element of data) {
    nft.put(element.id, JSON.stringify(element));
  }
  return new Response(JSON.stringify({ ok: 'ok' }), {
    status: 201, // Created
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const uriSegments = new URL(request.url).pathname.split('/').splice(1);
  console.log(`Handling request for ${uriSegments}`);

  if (uriSegments[0] === 'get-asset') {
    return await getAsset(uriSegments[1]);
  }

  if (uriSegments[0] === 'get-db') {
    return await getDB();
  }

  if (uriSegments[0] === 'add-db') {
    return await addDb(request);
  }

  if (uriSegments[0] === 'add-db-five') {
    return await addDbFiveAtATime(request);
  }

  return new Response(
    JSON.stringify({
      error: "Howdy, I am a worker, here is my idle response because you didn't sent anything to work on.",
    }),
    {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}

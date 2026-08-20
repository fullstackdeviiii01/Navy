import { NextRequest } from 'next/server';
import crypto from 'crypto';

function generateSign(apiName: string, params: Record<string, string>, appSecret: string): string {
  // Step 1: Sort params
  const sortedStr = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join('');

  // Step 2: API name pehle add karo (System Interface rule)
  const stringToSign = apiName + sortedStr;

  // Step 3: HMAC-SHA256
  return crypto
    .createHmac('sha256', appSecret)
    .update(stringToSign)
    .digest('hex')
    .toUpperCase();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return Response.json({ error: 'No code received' });
  }

  const appKey = process.env.ALI_APP_KEY!;
  const appSecret = process.env.ALI_APP_SECRET!;
  const timestamp = Date.now().toString();
  const apiName = '/auth/token/create';

  const params: Record<string, string> = {
    app_key: appKey,
    timestamp,
    sign_method: 'sha256',
    code,
  };

  params.sign = generateSign(apiName, params, appSecret);

  const queryString = new URLSearchParams(params).toString();
  const url = `https://api-sg.aliexpress.com/rest${apiName}?${queryString}`;

  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();

  console.log('TOKEN DATA:', JSON.stringify(data));

  return Response.json({ success: true, code, tokenData: data });
}
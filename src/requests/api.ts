import { Battery, Sms, CallLog, Contact, LocationInfo, ServerConfig } from '@/types/api';
import { Body, fetch as tauriFetch, ResponseType } from '@tauri-apps/api/http';

async function calculateSign(timestamp: number, secret?: string): Promise<string> {
  if (!secret) return '';
  const message = `${timestamp}\n${secret}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await window.crypto.subtle.sign(
    "HMAC",
    key,
    messageData
  );

  const hashArray = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  const base64Sign = window.btoa(binary);
  return encodeURIComponent(base64Sign);
}

const baseRequest = async (url: string, data: any, secret?: string) => {
  const timestamp = Date.now();
  const sign = await calculateSign(timestamp, secret);

  const body = {
    data,
    timestamp,
    sign,
  };

  let res: {
    'timestamp': number,
    'code': number,
    'msg': string,
    data: any
  };
  if ('__TAURI_IPC__' in window) {
    const req = await tauriFetch(url, {
      method: 'POST',
      body: Body.json(body),
      responseType: ResponseType.JSON,
    });
    res = req.data as any;
  }
  else {
    const req = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    res = await req.json();
  }
  if (res.code === 200) return res.data;
  else throw new Error(res.msg || '请求失败');
};

export default {
  async battery(host: string, secret?: string) {
    return await baseRequest(host + '/battery/query', {}, secret) as Battery;
  },
  async sms(host: string, secret?: string, page = 1) {
    return await baseRequest(host + '/sms/query', {
      page_num: page,
      page_size: 20,
    }, secret) as Sms[];
  },
  async sendSms(host: string, secret?: string, form?: any) {
    return await baseRequest(host + '/sms/send', form, secret) as string;
  },
  async callLogs(host: string, secret?: string, page = 1, type = 0, phoneNumber = '') {
    return await baseRequest(host + '/call/query', {
      page_num: page,
      page_size: 20,
      type,
      phone_number: phoneNumber,
    }, secret) as CallLog[];
  },
  async contacts(host: string, secret?: string, name = '', phoneNumber = '') {
    return await baseRequest(host + '/contact/query', {
      name,
      phone_number: phoneNumber,
    }, secret) as Contact[];
  },
  async addContact(host: string, secret?: string, name: string, phoneNumber: string) {
    return await baseRequest(host + '/contact/add', {
      name,
      phone_number: phoneNumber,
    }, secret) as string;
  },
  async wol(host: string, secret?: string, mac: string, ip?: string, port?: number) {
    return await baseRequest(host + '/wol/send', {
      mac,
      ip,
      port,
    }, secret) as string;
  },
  async location(host: string, secret?: string) {
    return await baseRequest(host + '/location/query', {}, secret) as LocationInfo;
  },
  async config(host: string, secret?: string) {
    return await baseRequest(host + '/config/query', {}, secret) as ServerConfig;
  },
};

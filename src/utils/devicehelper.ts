import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as UAParser from 'ua-parser-js';
import type { IResult } from 'ua-parser-js';

export interface DeviceInfoData {
  ipAddress: string;
  deviceType: string;
  osType: string;
  browser: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface RequestLike {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}

interface GeoIPResponse {
  status: string;
  country: string;
  city: string;
  lat: number;
  lon: number;
  message?: string;
  query: string;
}

const RESERVED_IP_REGEX =
  /^(127\.0\.0\.1|10\..*|192\.168\..*|172\.(1[6-9]|2[0-9]|3[0-1])\..*|::1|fc00:|fe80:)/;

@Injectable()
export class DeviceHelper {
  async extractDeviceInfo(req: RequestLike): Promise<DeviceInfoData> {
    // Normalize user-agent
    const rawUA = req.headers['user-agent'];
    const userAgent = Array.isArray(rawUA) ? rawUA[0] : (rawUA ?? '');

    // ✅ Construct UAParser correctly
    const parser = new UAParser.UAParser(userAgent);
    const result: IResult = parser.getResult();

    const xff = req.headers['x-forwarded-for'];
    let ip: string = Array.isArray(xff)
      ? xff[0]
      : typeof xff === 'string'
        ? xff.split(',')[0]
        : (req.ip ?? req.socket?.remoteAddress ?? '');

    ip = ip.trim();

    if (RESERVED_IP_REGEX.test(ip)) ip = '';

    let location: string | null = null;
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (ip) {
      try {
        const geo: AxiosResponse<GeoIPResponse> = await axios.get(
          `http://ip-api.com/json/${ip}`,
        );
        if (geo.data.status === 'success') {
          location = `${geo.data.city}, ${geo.data.country}`;
          latitude = geo.data.lat;
          longitude = geo.data.lon;
        }
      } catch (err: unknown) {
        console.error(
          'GeoIP lookup failed:',
          err instanceof Error ? err.message : err,
        );
      }
    }

    return {
      ipAddress: ip,
      deviceType: result.device?.type ?? 'Desktop',
      osType: result.os?.name ?? 'Unknown OS',
      browser: result.browser?.name ?? 'Unknown Browser',
      location,
      latitude,
      longitude,
    };
  }
}

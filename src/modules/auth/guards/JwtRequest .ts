import { JwtPayload } from '../interface/jwt-payload.interface';

export interface JwtRequest {
  user: JwtPayload;
}

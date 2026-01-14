export abstract class ITokenService {
  abstract createToken(payload: any): string;
  abstract verifyToken(token: string): any;
}

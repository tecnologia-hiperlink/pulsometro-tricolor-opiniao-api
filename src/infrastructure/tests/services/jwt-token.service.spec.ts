import { JwtTokenService } from '../../services/jwt-token.service';

describe('JwtTokenService', () => {
  it('should call JwtService.sign when creating a token and JwtService.verify when verifying', () => {
    const mockJwt = {
      sign: jest.fn().mockReturnValue('fake-token'),
      verify: jest.fn().mockReturnValue({ sub: '123', name: 'Tester' }),
    } as any;

    const service = new JwtTokenService(mockJwt);

    const token = service.createToken({ sub: '123' });
    expect(token).toBe('fake-token');
    expect(mockJwt.sign).toHaveBeenCalledWith({ sub: '123' });

    const payload = service.verifyToken('fake-token');
    expect(payload).toEqual({ sub: '123', name: 'Tester' });
    expect(mockJwt.verify).toHaveBeenCalledWith('fake-token');
  });
});

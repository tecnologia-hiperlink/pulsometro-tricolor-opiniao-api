import { BcryptHashService } from '../../services/bcrypt-hash.service';

describe('BcryptHashService', () => {
  let service: BcryptHashService;

  beforeEach(() => {
    service = new BcryptHashService();
  });

  it('should hash and compare a password', async () => {
    const password = 'S3nh@Segura!';
    const hash = await service.hash(password);

    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);

    const isMatch = await service.compare(password, hash);
    expect(isMatch).toBe(true);

    const isNotMatch = await service.compare('other', hash);
    expect(isNotMatch).toBe(false);
  });
});

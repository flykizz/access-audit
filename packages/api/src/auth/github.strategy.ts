import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AuthService } from './auth.service';

type VerifyCallback = (error: any, user?: any, info?: any) => void;

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private authService: AuthService) {
    const clientID = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    
    if (!clientID || !clientSecret) {
      super({
        clientID: 'dummy',
        clientSecret: 'dummy',
        callbackURL: 'http://localhost:3000/auth/github/callback',
        scope: ['user:email'],
      });
      return;
    }
    
    super({
      clientID,
      clientSecret,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { username, emails, photos } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : `${username}@github.com`;
    const user = await this.authService.validateOAuthUser({
      email,
      name: profile.displayName || username,
      provider: 'github',
      providerId: profile.id,
      avatarUrl: photos && photos.length > 0 ? photos[0].value : null,
    });
    done(null, user);
  }
}

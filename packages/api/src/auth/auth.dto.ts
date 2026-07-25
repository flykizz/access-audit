import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'newPassword123' })
  password!: string;

  @ApiProperty({ example: 'reset-token-value' })
  token!: string;
}

export class AuthResponse {
  @ApiProperty({ example: 'user-uuid' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: 3 })
  credits!: number;

  @ApiProperty({ example: 'jwt-token' })
  accessToken!: string;
}
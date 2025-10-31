import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@app/common/decorators/public.decorator';
import { LoginDTO } from './dto/login.dto';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDTO })
  async login(@Body() dto: LoginDTO) {
    return await this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDTO })
  async refresh(@Body() dto: RefreshTokenDTO) {
    return await this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @ApiBody({ type: RefreshTokenDTO })
  async logout(@Body() dto: RefreshTokenDTO) {
    await this.authService.logout(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }
}

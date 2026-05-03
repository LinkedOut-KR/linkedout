import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: { id: string }) {
    return this.users.findById(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() body: { bio?: string; githubUrl?: string; linkedinUrl?: string; portfolioUrl?: string; nickname?: string },
  ) {
    return this.users.updateProfile(user.id, body);
  }

  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.users.getPublicProfile(id);
  }
}

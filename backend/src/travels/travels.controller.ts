import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TravelsService } from './travels.service';
import { CreateTravelDto } from './dto/create-travel.dto';
import { UpdateTravelDto } from './dto/update-travel.dto';
import { FilterTravelsDto } from './dto/filter-travels.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('travels')
export class TravelsController {
  constructor(private travels: TravelsService) {}

  @Public()
  @Get()
  list(@Query() filter: FilterTravelsDto) {
    return this.travels.list(filter);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.travels.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateTravelDto) {
    return this.travels.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTravelDto) {
    return this.travels.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.travels.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.travels.duplicate(id);
  }
}

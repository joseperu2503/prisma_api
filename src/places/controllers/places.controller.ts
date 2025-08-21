import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/models/user.model';
import { FindOrCreatePlaceRequest } from '../dto/find-or-create-place-request.dto';
import { getSuggestionGeometryRequest } from '../dto/get-suggestion-geometry-request.dto';
import { GetSuggestionsRequest } from '../dto/get-suggestions-request.dto';
import { ReverseGeocodeRequest } from '../dto/reverse-geocode-request.dto';
import { Place } from '../models/place.model';
import { PlacesService } from '../services/places.service';
import { UserPlaceService } from '../services/user-place.service';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private readonly userPlaceService: UserPlaceService,
  ) {}

  @Post('find-or-create')
  @Auth()
  async findPlace(
    @GetUser() user: User,
    @Body() request: FindOrCreatePlaceRequest,
  ): Promise<Place> {
    const place = await this.placesService.findOrCreate(request);
    await this.userPlaceService.registerUsage(user.id, place.id);
    return place;
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.placesService.findAllByUser(user.id);
  }

  @Delete(':placeId')
  @Auth()
  async delete(@GetUser() user: User, @Param('placeId') placeId: string) {
    return this.userPlaceService.delete(user.id, placeId);
  }

  @Post('suggestions')
  async suggestions(@Body() request: GetSuggestionsRequest) {
    return this.placesService.suggestions(request.query);
  }

  @Post('reverse-geocode')
  async reverseGeocode(@Body() request: ReverseGeocodeRequest) {
    const { latitude, longitude } = request;
    return this.placesService.reverseGeocode(latitude, longitude);
  }

  @Post('suggestion-geometry')
  async getSuggestionGeometry(@Body() request: getSuggestionGeometryRequest) {
    return this.placesService.getSuggestionGeometry(request.suggestionId);
  }
}

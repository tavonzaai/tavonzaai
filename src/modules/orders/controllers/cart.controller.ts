// ============================================================================
// Order Presentation — CartController
// ============================================================================
// The cart belongs to the authenticated diner (customer account or seated
// guest session). No route accepts a cart, customer or order id for ownership.
// ============================================================================

import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiStandardErrors } from '../../../common/swagger';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { CustomerPrincipalService } from '../../identity/services/customer-principal.service';
import { CartService } from '../services/cart.service';
import { AddToCartDto, UpdateCartItemDto } from '../dto/order-request.dto';
import { CartResponseDto } from '../dto/order-response.dto';

@ApiTags('Customer | Cart')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly principals: CustomerPrincipalService,
  ) {}

  @Get()
  @ApiOperation({ summary: '[Customer] Get my cart', description: 'Returns the persisted cart with catalog-priced lines.' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiStandardErrors(401, 403, 500)
  async getCart(@CurrentUser() user: JwtPayload): Promise<CartResponseDto> {
    const principal = await this.principals.resolve(user);
    return CartResponseDto.fromView(await this.cartService.getCart(principal));
  }

  @Post('items')
  @ApiOperation({
    summary: '[Customer] Add an item to my cart',
    description: 'Identical item + add-ons + instructions merge into one line. Prices come from the catalog.',
  })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 409, 422, 500)
  async addItem(@CurrentUser() user: JwtPayload, @Body() dto: AddToCartDto): Promise<CartResponseDto> {
    const principal = await this.principals.resolve(user);
    return CartResponseDto.fromView(await this.cartService.addItem(principal, dto));
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: '[Customer] Change quantity or instructions of a cart line' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 409, 422, 500)
  async updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    const principal = await this.principals.resolve(user);
    return CartResponseDto.fromView(await this.cartService.updateItem(principal, itemId, dto));
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: '[Customer] Remove a line from my cart' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiStandardErrors(400, 401, 403, 404, 500)
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ): Promise<CartResponseDto> {
    const principal = await this.principals.resolve(user);
    return CartResponseDto.fromView(await this.cartService.removeItem(principal, itemId));
  }

  @Delete()
  @ApiOperation({ summary: '[Customer] Empty my cart' })
  @ApiOkResponse({ type: CartResponseDto })
  @ApiStandardErrors(401, 403, 500)
  async clear(@CurrentUser() user: JwtPayload): Promise<CartResponseDto> {
    const principal = await this.principals.resolve(user);
    return CartResponseDto.fromView(await this.cartService.clear(principal));
  }
}

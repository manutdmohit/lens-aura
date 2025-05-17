// Export all models from a single file for easier imports
export { default as Product } from './Product';
export { default as Glasses } from './Glasses';
export { default as Sunglasses } from './Sunglasses';
export { default as ContactLenses } from './ContactLenses';
export { default as Order } from './Order';
export { default as Review } from './Review';
export { default as Coupon } from './Coupon';
export { default as User } from './User';
export { default as Cart } from './Cart';

// Export interfaces
export type { IProduct } from './Product';
export type { IGlasses } from './Glasses';
export type { ISunglasses } from './Sunglasses';
export type { IContactLenses } from './ContactLenses';
export type { IOrder } from './Order';
export type { IReview } from './Review';
export type { ICoupon } from './Coupon';
export type { IUser } from './User';
export type { ICart, ICartItem } from './Cart';

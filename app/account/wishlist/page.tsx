import { getWishlist } from "./actions";
import WishlistClient from "./WishlistClient";

export default async function WishlistPage() {
  const wishlistItems = await getWishlist();

  return <WishlistClient initialItems={wishlistItems} />;
}

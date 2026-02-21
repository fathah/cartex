import { getCategories } from "@/actions/categories";
import CategoryList from "./CategoryList";

export const dynamic = "force-dynamic";

const CategoriesIndex = async () => {
  const categories = await getCategories();

  return <CategoryList initialCategories={categories} />;
};

export default CategoriesIndex;

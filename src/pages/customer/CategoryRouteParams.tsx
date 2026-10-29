import { useParams } from "react-router-dom";
import { CategoryListingPage } from "./CategoryPages";
import { ProductPage } from "./ProductPage";
import { TrackingPage } from "./TrackingPage";

export function CategoryRoute() {
  const { id = "" } = useParams();
  return <CategoryListingPage id={id} />;
}

export function ProductRoute() {
  const { id = "" } = useParams();
  return <ProductPage id={id} />;
}

export function TrackingRoute() {
  const { id = "" } = useParams();
  return <TrackingPage id={id} />;
}

export const REVIEW_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
];

export function sortPropertyReviews(reviews, sortKey = "newest") {
  const list = [...reviews];

  switch (sortKey) {
    case "highest":
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "lowest":
      return list.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    default:
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export function invalidateNotificationQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

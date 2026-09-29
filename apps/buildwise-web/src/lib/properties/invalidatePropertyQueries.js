import { invalidateNotificationQueries } from "@/lib/notifications/invalidateNotificationQueries";

export function invalidatePropertyQueries(queryClient, { propertyId } = {}) {
  const tasks = [
    queryClient.resetQueries({ queryKey: ["my-properties"] }),
    queryClient.resetQueries({ queryKey: ["admin-properties"] }),
    queryClient.invalidateQueries({ queryKey: ["properties"] }),
    invalidateNotificationQueries(queryClient),
  ];

  if (propertyId) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] }),
    );
  }

  return Promise.all(tasks);
}

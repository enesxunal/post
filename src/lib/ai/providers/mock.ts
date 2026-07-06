export async function generateImageMock(
  prompt: string,
  inputImageUrls: string[] = [],
  options?: Record<string, string | number | boolean>,
) {
  void prompt;
  void inputImageUrls;
  void options;

  return {
    provider: "mock" as const,
    imageUrl: "https://placehold.co/1080x1080/png?text=AI+Post",
    thumbnailUrl: "https://placehold.co/540x540/png?text=AI+Post",
    status: "ready" as const,
  };
}

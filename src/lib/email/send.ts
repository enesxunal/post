export async function sendProjectReadyEmail(userEmail: string, projectUrl: string) {
  // TODO: configure email provider
  return {
    ok: true,
    message: `Mock email queued for ${userEmail}`,
    projectUrl,
  };
}

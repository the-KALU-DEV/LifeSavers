export function verifyMedia(req: any): string | null {
    const message = req.body.message?.trim();
    const numMedia = parseInt(req.body.NumMedia) || 0;

    let finalBody = message;

    if (numMedia > 0) {
        const mediaUrl = req.body.MediaUrl0;
  
        if (!finalBody) {
            finalBody = `[MEDIA]: ${mediaUrl}`;
        } else {
            finalBody += `\n\n[MEDIA]: ${mediaUrl}`;
        }
    }

    return finalBody || null;
}

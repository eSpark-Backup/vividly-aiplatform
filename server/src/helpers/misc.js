function isImage(buffer) {
    // Check for common image format signatures
    const signatures = {
        // JPEG
        'ffd8ff': 'image/jpeg',
        // PNG
        '89504e47': 'image/png',
        // GIF
        '47494638': 'image/gif',
        // WEBP
        '52494646': 'image/webp'
    };

    // Get first 4 bytes as hex
    const hex = buffer.slice(0, 4).toString('hex');

    // Check against signatures
    for (const [signature, mime] of Object.entries(signatures)) {
        if (hex.startsWith(signature.substring(0, hex.length))) {
            return {
                mime,
                ext: mime.split('/')[1]
            };
        }
    }

    return null;
}

export {isImage}
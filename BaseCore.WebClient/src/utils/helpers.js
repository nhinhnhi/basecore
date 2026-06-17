export const getLogoUrl = (brand) => {
    if (brand.logoUrl && !brand.logoUrl.includes('placehold')) {
        // Nếu là URL local (/img/...) thì thêm domain MyClient
        if (brand.logoUrl.startsWith('/')) {
            return `${import.meta.env.VITE_CLIENT_URL}${brand.logoUrl}`;
        }
        return brand.logoUrl; // URL đầy đủ thì giữ nguyên
    }
    return null;
};

export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
    return `${import.meta.env.VITE_CLIENT_URL}${url}`;
};
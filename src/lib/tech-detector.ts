export function detectTechAndSeo(html: string, url: string): { tech_stack: string[], has_ssl: boolean } {
    const tech_stack: string[] = [];
    const lowerHtml = html.toLowerCase();

    // SSL Check
    const has_ssl = url.startsWith('https');

    // CMS Detection
    if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) {
        tech_stack.push('WordPress');
    }
    if (lowerHtml.includes('wix.com') || lowerHtml.includes('wix-image')) {
        tech_stack.push('Wix');
    }
    if (lowerHtml.includes('shopify')) {
        tech_stack.push('Shopify');
    }
    if (lowerHtml.includes('squarespace')) {
        tech_stack.push('Squarespace');
    }
    if (lowerHtml.includes('jumpseller')) {
        tech_stack.push('Jumpseller');
    }
    if (lowerHtml.includes('elementor')) {
        tech_stack.push('Elementor');
    }

    return { tech_stack, has_ssl };
}

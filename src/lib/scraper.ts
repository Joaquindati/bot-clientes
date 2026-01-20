import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedData, SocialLinks } from './types';
import { detectTechAndSeo } from './tech-detector';

function normalizeUrl(url: string): string {
    if (!url.startsWith('http')) {
        return `http://${url}`;
    }
    return url;
}

export async function scrapeWebsite(url: string): Promise<ScrapedData> {
    if (!url || url === 'N/A') {
        return {
            emails: [],
            socials: {},
            tech_stack: [],
            has_ssl: false,
            website_status: 'No URL'
        };
    }

    try {
        const targetUrl = normalizeUrl(url);
        const response = await axios.get(targetUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extract Socials
        const socials: SocialLinks = {};
        const emails = new Set<string>();

        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;

            const lowerHref = href.toLowerCase();

            // Socials
            if (lowerHref.includes('facebook.com') && !socials.facebook) socials.facebook = href;
            if (lowerHref.includes('instagram.com') && !socials.instagram) socials.instagram = href;
            if (lowerHref.includes('linkedin.com') && !socials.linkedin) socials.linkedin = href;
            if ((lowerHref.includes('twitter.com') || lowerHref.includes('x.com')) && !socials.twitter) socials.twitter = href;

            // WhatsApp
            if (lowerHref.includes('wa.me') || lowerHref.includes('api.whatsapp.com')) {
                // Extract number logic
                const match = lowerHref.match(/(?:wa\.me\/|phone=)(\d+)/);
                if (match) {
                    socials.whatsapp_link = `https://web.whatsapp.com/send?phone=${match[1]}`;
                } else {
                    socials.whatsapp_link = href;
                }
            }

            // Mailto
            if (lowerHref.startsWith('mailto:')) {
                const email = lowerHref.replace('mailto:', '').split('?')[0];
                if (email && email.includes('@')) emails.add(email);
            }
        });

        // Body Text Email Extraction (Regex)
        const bodyText = $('body').text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const foundEmails = bodyText.match(emailRegex) || [];

        foundEmails.forEach(email => {
            if (!email.match(/\.(png|jpg|jpeg|gif|css|js|woff|ttf)$/i)) {
                emails.add(email);
            }
        });

        // Tech Detection
        const { tech_stack, has_ssl } = detectTechAndSeo(html, targetUrl);

        return {
            emails: Array.from(emails),
            socials,
            tech_stack,
            has_ssl,
            website_status: 'Success'
        };

    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return {
            emails: [],
            socials: {},
            tech_stack: [],
            has_ssl: false,
            website_status: 'Failed'
        };
    }
}

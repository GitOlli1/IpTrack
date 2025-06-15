import type { IPData } from "./Interface";

export const GetDataForIP = async (ipAddress: string): Promise<IPData> => {
    const arinController = new AbortController();
    const geoController = new AbortController();

    const arinTimeout = setTimeout(() => arinController.abort(), 3000);
    const geoTimeout = setTimeout(() => geoController.abort(), 3000);

    try {
        // ARIN WHOIS
        const arinRes = await fetch(`https://whois.arin.net/rest/ip/${ipAddress}`, {
            signal: arinController.signal
        });
        clearTimeout(arinTimeout);

        if (!arinRes.ok) throw new Error(`ARIN fetch failed: ${arinRes.status}`);

        const arinText = await arinRes.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(arinText, "application/xml");
        const ns = "https://www.arin.net/whoisrws/core/v1";

        const getText = (tag: string) => xmlDoc.getElementsByTagNameNS(ns, tag)[0]?.textContent || '';

        const netBlock = xmlDoc.getElementsByTagNameNS(ns, "netBlock")[0];
        const startAddress = netBlock?.getElementsByTagNameNS(ns, "startAddress")[0]?.textContent || '';
        const cidr = netBlock?.getElementsByTagNameNS(ns, "cidrLength")[0]?.textContent || '';
        const netType = netBlock?.getElementsByTagNameNS(ns, "type")[0]?.textContent || '';

        const comments = Array.from(xmlDoc.getElementsByTagNameNS(ns, "comment"))
            .flatMap(c => Array.from(c.getElementsByTagNameNS(ns, "line")).map(line => line.textContent))
            .filter(Boolean)
            .join(' ');

        // IP Geolocation
        const geoRes = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
            signal: geoController.signal
        });
        clearTimeout(geoTimeout);

        if (!geoRes.ok) throw new Error(`GeoIP fetch failed: ${geoRes.status}`);

        const geoData = await geoRes.json();

        const getOrgInfo = () => {
             const el = xmlDoc.getElementsByTagNameNS(ns, "orgRef")[0];
             if (el) {
                 const handle = el.getAttribute("handle") || '';
                 const name = el.getAttribute("name") || '';
                 return `${name} (${handle})`;
             }
             return '';
         }

        return {
            netRange: `${getText("startAddress")} - ${getText("endAddress")}`,
            cidr: startAddress && cidr ? `${startAddress}/${cidr}` : '',
            name: getText("name"),
            handle: getText("handle"),
            parent: '', // kann optional ergänzt werden
            netType: netType,
            originAs: '',
            organization: getOrgInfo(),
            registrationDate: getText("registrationDate")?.split("T")[0],
            lastUpdated: getText("updateDate")?.split("T")[0],
            restfulLink: getText("ref"),
            comments: comments,
            geo: {
                ip: geoData.ip,
                city: geoData.city,
                region: geoData.region,
                country: geoData.country_name,
                latitude: geoData.latitude,
                longitude: geoData.longitude
            }
        };

    } catch (err) {
        console.error("Error fetching IP data:", err);
        throw err;
    }
}

import type { DomainData } from "./Interface";

export const GetDataForDomain = async (domainName: string): Promise<DomainData & { ip?: string }> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
        // Für .com und .net via Verisign (CORS-fähig aus Browser)
        const tld = domainName.split('.').pop()?.toLowerCase();
        let rdapUrl = '';

        if (tld === 'com' || tld === 'net') {
            rdapUrl = `https://rdap.verisign.com/com/v1/domain/${domainName}`;
        } else {
            throw new Error(`Unsupported TLD or CORS restriction for TLD: ${tld}`);
        }

        const response = await fetch(rdapUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`RDAP fetch failed: ${response.status}`);

        const data = await response.json();

        // IP via Google DNS over HTTPS holen
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${domainName}&type=A`);
        if (!dnsResponse.ok) throw new Error(`DNS lookup failed: ${dnsResponse.status}`);

        const dnsData = await dnsResponse.json();
        const answer = dnsData.Answer?.find((a: any) => a.type === 1); // A record
        const ip = answer?.data || '';

        // Parsen relevanter Felder aus RDAP JSON
        const name = data.ldhName || '';
        const handle = data.handle || '';
        const status = data.status?.join(', ') || '';
        const registrar = data.entities?.find((e: any) => e.roles?.includes('registrar'))?.vcardArray?.[1]?.find((v: any[]) => v[0] === 'fn')?.[3] || '';
        const registrationDate = data.events?.find((e: any) => e.eventAction === 'registration')?.eventDate?.split('T')[0] || '';
        const lastUpdated = data.events?.find((e: any) => e.eventAction === 'last changed')?.eventDate?.split('T')[0] || '';

        return {
            domainName: name,
            handle: handle,
            status: status,
            registrar: registrar,
            registrationDate: registrationDate,
            lastUpdated: lastUpdated,
            restfulLink: data.links?.[0]?.href || '',
            ip,
        };

    } catch (err) {
        console.error("Error fetching domain data:", err);
        throw err;
    }
};

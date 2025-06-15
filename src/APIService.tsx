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
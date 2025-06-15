export const GetDataForIP = async (ipAddress: string) => {
    console.log(ipAddress);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
        const response = await fetch(`https://whois.arin.net/rest/ip/${ipAddress}`, {
            method: 'GET',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Something went wrong: ${response.status}`);
        }

        const text = await response.text();
        console.log(text);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");

        const ns = "https://www.arin.net/whoisrws/core/v1";

        // Hilfsfunktion zum Auslesen von Text aus erstem Tag im Namespace
        const getText = (tag: string) =>
            xmlDoc.getElementsByTagNameNS(ns, tag)[0]?.textContent?.trim() || '';

        // Kommentartexte aus <comment><line>...</line></comment> zusammensetzen
        const commentElement = xmlDoc.getElementsByTagNameNS(ns, "comment")[0];
        let comments = "";
        if (commentElement) {
            const lines = commentElement.getElementsByTagNameNS(ns, "line");
            const commentLines: string[] = [];
            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i].textContent?.trim();
                if (lineText) commentLines.push(lineText);
            }
            comments = commentLines.join("\n");
        }

        // netBlock ist unter netBlocks/netBlock
        const netBlock = xmlDoc.getElementsByTagNameNS(ns, "netBlock")[0];
        const startAddress = netBlock?.getElementsByTagNameNS(ns, "startAddress")[0]?.textContent?.trim() || '';
        const endAddress = netBlock?.getElementsByTagNameNS(ns, "endAddress")[0]?.textContent?.trim() || '';
        const cidr = netBlock?.getElementsByTagNameNS(ns, "cidrLength")[0]?.textContent?.trim() || '';
        const netType = netBlock?.getElementsByTagNameNS(ns, "type")[0]?.textContent?.trim() || '';
        const netDescription = netBlock?.getElementsByTagNameNS(ns, "description")[0]?.textContent?.trim() || '';

        // Org Info aus orgRef-Attributen
        const orgRef = xmlDoc.getElementsByTagNameNS(ns, "orgRef")[0];
        const organization = orgRef
            ? `${orgRef.getAttribute("name") || ''} (${orgRef.getAttribute("handle") || ''})`
            : '';

        // Parent info falls vorhanden (nicht in deinem Beispiel)
        const parentNetRef = xmlDoc.getElementsByTagNameNS(ns, "parentNetRef")[0];
        const parent = parentNetRef
            ? `${parentNetRef.getAttribute("name") || ''} (${parentNetRef.getAttribute("handle") || ''})`
            : '';

        const result = {
            netRange: startAddress && endAddress ? `${startAddress} - ${endAddress}` : '',
            cidr: startAddress && cidr ? `${startAddress}/${cidr}` : '',
            name: getText("name"),
            handle: getText("handle"),
            parent: parent,
            netType: netType,
            originAs: '', // nicht im XML enthalten in deinem Beispiel
            organization: organization,
            registrationDate: getText("registrationDate")?.split("T")[0] || '',
            lastUpdated: getText("updateDate")?.split("T")[0] || '',
            comments: comments || netDescription || '',
            restfulLink: getText("ref"),
            seeAlso: [
                "Related POC records.",
                "Related organization's POC records.",
                "Related delegations."
            ]
        };

        return result;

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

export interface IPData {
    cidr: string,
    comments: string,
    handle: string,
    lastUpdated: string,
    name: string,
    netRange: string,
    netType: string,
    organization: string,
    originAs: string,
    parent: string,
    registrationDate: string,
    restfulLink: string,
    geo: {
        ip: string;
        city: string;
        region: string;
        country: string;
        latitude: number;
        longitude: number;
    }
}

export interface DomainData {
    domainName: string;
    handle: string;
    status: string;
    registrar: string;
    registrationDate: string;
    lastUpdated: string;
    restfulLink: string;
    ip: string;
}

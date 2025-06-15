import { useState } from 'react';
import { GetDataForDomain } from '../APIService';
import './URLTracken.css';
import './IpTracken.css';
import { Form, Table } from 'react-bootstrap';
import type { DomainData } from '../Interface';

// Erlaubte TLDs
const allowedTLDs = ['com', 'net'];

export const URLTracken = () => {
  const [domain, setDomain] = useState('');
  const [data, setData] = useState<DomainData>();
  const [isLoading, setIsLoading] = useState(false);

  // Hilfsfunktion, um die TLD zu extrahieren
  const getTLD = (domain: string): string | null => {
    const parts = domain.toLowerCase().trim().split('.');
    if (parts.length < 2) return null;
    return parts[parts.length - 1];
  };

  // Prüfe, ob TLD erlaubt ist
  const isValidTLD = (): boolean => {
    const tld = getTLD(domain);
    return tld !== null && allowedTLDs.includes(tld);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isValidTLD()) return;

    GetDataForDomain(domain)
      .then((response) => {
        console.log(response);
        setData(response);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false);
      });
  };

  return (
    <>
      <div>URL Tracken:</div>
      <Form onSubmit={handleSubmit}>
        <Form.Control
          value={domain}
          placeholder="z.B. google.com"
          onChange={(e) => setDomain(e.target.value)}
        />
        <div className="ip-tracken-button-position">
          <button
            type="submit"
            className="ip-tracken-button-style"
            disabled={!isValidTLD()}
          >
            Senden
          </button>
        </div>
      </Form>
      {!isValidTLD() && domain.length > 0 && (
        <div style={{ color: 'red', marginTop: '5px' }}>
          Nur Domains mit {allowedTLDs.join(', ')} sind erlaubt.
        </div>
      )}

      {isLoading &&
      <div>
        Loading...
      </div>
      }

      {!isLoading && data &&
        <div className="ip-tracker-data-container">
            <Table striped>
                <tbody>
                    <tr>
                        <td>Domain Name</td>
                        <td>{data.domainName}</td>
                    </tr>
                    <tr>
                        <td>IP</td>
                        <td>{data.ip}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>{data.status}</td>
                    </tr>
                    <tr>
                        <td>Registration Date</td>
                        <td>{data.registrationDate}</td>
                    </tr>
                    <tr>
                        <td>Last Updated</td>
                        <td>{data.lastUpdated}</td>
                    </tr>
                    <tr>
                        <td>Handle</td>
                        <td>{data.handle}</td>
                    </tr>
                    <tr>
                        <td>Registrar</td>
                        <td>{data.registrar}</td>
                    </tr>
                </tbody>
            </Table>
        </div>
      }
    </>
  );
};

import { useState } from "react"
import { Form, Table } from "react-bootstrap"
import './IpTracken.css';
import { GetDataForIP } from "../APIService";
import type { IPData } from "../Interface";

export const IpTracken = () => {
    const [ipAddress, setIpAddress] = useState('');
    const [data, setData] = useState<IPData>();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: any) => {
        e.preventDefault();
        setIsLoading(true);

        GetDataForIP(ipAddress)
        .then((response) => {
            console.log(response);
            setData(response);
            setIsLoading(false);
        })
    }

    return (
        <>
        <div>IP Tracken:</div>
        <Form onSubmit={handleSubmit}>
            <Form.Control
            placeholder="8.8.8.8"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            />
            <div className="ip-tracken-button-position">
                <button type="submit" className="ip-tracken-button-style">
                    Senden
                </button>
            </div>
        </Form>

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
                            <td>Net Range</td>
                            <td>{data?.netRange}</td>
                        </tr>
                        <tr>
                            <td>CIDR</td>
                            <td>{data?.cidr}</td>
                        </tr>
                        <tr>
                            <td>Name</td>
                            <td>{data?.name}</td>
                        </tr>
                        <tr>
                            <td>Handle</td>
                            <td>{data?.handle}</td>
                        </tr>
                        <tr>
                            <td>Parent</td>
                            <td>{data?.parent}</td>
                        </tr>
                        <tr>
                            <td>Net Type</td>
                            <td>{data?.netType}</td>
                        </tr>
                        <tr>
                            <td>Origin AS</td>
                            <td>{data?.originAs}</td>
                        </tr>
                        <tr>
                            <td>Organization</td>
                            <td>{data?.organization}</td>
                        </tr>
                        <tr>
                            <td>Registration Date</td>
                            <td>{data?.registrationDate}</td>
                        </tr>
                        <tr>
                            <td>Last Updated</td>
                            <td>{data?.lastUpdated}</td>
                        </tr>
                    </tbody>
                </Table>
                <div className="ip-tracker-comment">
                    <div>
                        Comments:
                    </div>
                    {data.comments &&
                    <div className="ip-tracker-comment-container">
                        {data?.comments}
                    </div>
                    }
               </div>
            </div>
        }
        </>
    )
}
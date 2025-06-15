import { useState } from 'react';
import './Body.css';
import {Card} from 'react-bootstrap';
import { IpTracken } from './IpTracken';
import { URLTracken } from './URLTracken';

export const Body = () => {
    const [activeTab, setActiveTab] = useState('tab1');
    return (
        <>
        <div className='body-position'>
            <Card className='body-size shadow-sm border-0'>
                <div className='container'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <button className={`nav-link ${activeTab === 'tab1' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('tab1')}>
                                IP Tracken
                            </button>
                        </li>
                        <li className='nav-item'>
                            <button className={`nav-link ${activeTab === 'tab2' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tab2')}>
                                URL Tracken
                            </button>
                        </li>
                    </ul>

                    <div className="p-4">
                        {activeTab === 'tab1' && 
                        <div>
                            <IpTracken/>
                        </div>}
                        {activeTab === 'tab2' && 
                        <div>
                            <URLTracken/>
                        </div>}
                    </div>
                </div>
            </Card>
        </div>
        </>
    )
}
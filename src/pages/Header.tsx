import './Header.css';
import logo from './../../public/iptrack_logo.png';

export const Header = () => {
    return (
        <>
        <div className="header">
            <img className="header-logo-size" src={logo}/>
            IpTrack
        </div>
        </>
    )
}
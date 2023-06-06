import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar} from 'react-bootstrap';
import { FaBell, FaSignInAlt, FaSignOutAlt  } from "react-icons/fa";
import { logout } from "../../services/accoutService";
import { removeCookie } from "../../util/cookieService";
import { Role, RouterPath } from "../../util/enum/Enum";
import { User } from "../../models/user";
import userIcon from "../../../src/user128.png";
import { getResetPasswordRequest } from "../../services/accoutService";

interface NavitationProps {
  loggedInUser: User | null
}

const Navigation = ({loggedInUser} : NavitationProps) => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    async function getAllResetPassword() {
      const data:any = await getResetPasswordRequest(navigate);
      setNotificationCount(data.length);
    }
    getAllResetPassword();
    const interval = setInterval(getAllResetPassword, 500);
    return () => {
      clearInterval(interval); 
    };
  }, [navigate]);

  async function logout1(): Promise<void> {    
    var x = await logout(navigate);  
    if(x){
      removeCookie("sv");
      navigate(RouterPath.Home);
    }
  }

  return (
    <div>
      <Navbar bg="primary" expand="lg">
        <Container fluid>
          {loggedInUser ? <Navbar.Brand><Link style={{ color: "#ffffff", paddingRight:"20px" }} to={loggedInUser.roleflg===Role.Admin ? RouterPath.EngineerList : RouterPath.MyPage }>スキケン</Link></Navbar.Brand> : 
          <Navbar.Brand><Link style={{ color: "#ffffff", paddingRight:"20px" }} to={RouterPath.Home}>スキケン</Link></Navbar.Brand>}        
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav"> 
            <Nav className="me-auto">              
            </Nav>            
              { loggedInUser?.roleflg===Role.Admin ? 

                <div>
                    <Link to={RouterPath.CreateAccount} style={{ paddingRight:'12px', paddingLeft:'2px' }}>
                      <img src={userIcon} alt="Edit" width={24} height={24}/>
                    </Link>
                    <Link to={RouterPath.PasswordReset} style={{ textDecoration: 'none', color: "#ffffff", paddingRight:'12px', paddingLeft:'2px' }}>
                      <FaBell></FaBell>
                      {notificationCount > 0 && (
                        <span style={{ color: "#ffffff", position: 'absolute', top: '20px', transform: 'translate(-50%, -50%)' }}>{notificationCount}</span>
                      )}
                    </Link>
                </div>

              : null
              }       
            {loggedInUser ? <Nav style={{ color: "#ffffff" }}>ユーザー名&nbsp;:&nbsp;{loggedInUser.name}&nbsp;&nbsp;&nbsp;</Nav> : null}            
            <Nav>
              {
                loggedInUser ? <span onClick={logout1} style={{ color: "#ffffff", paddingRight:"31px", cursor: "pointer" }}>ログアウト <FaSignOutAlt/></span>  
                 : <Link to={RouterPath.Login} style={{ color: "#ffffff", paddingRight:"31px" }}>ログイン <FaSignInAlt/></Link>                                 
              } 
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Navigation;
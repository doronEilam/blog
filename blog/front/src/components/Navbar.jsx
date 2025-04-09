import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddBoxIcon from "@mui/icons-material/AddBox"; // Added missing import

export default function Navbar() {
  const { currentUser, logout, isInGropes, isAdmin } = useAuth(); // Added isAdmin
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userIsEditor = () => isInGropes && isInGropes("Editor");

  const getInitials = () => {
    if (!currentUser || !currentUser.username) return "U";
    return currentUser.username.charAt(0).toUpperCase();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={2} sx={{ bgcolor: "primary.dark" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 2 }}
            onClick={() => navigate("/")}
          >
            <HomeIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            My Blog App
          </Typography>
          {currentUser ? (
            <>
              {/* Conditionally render Dashboard link - ONLY for Admins */}
              {isAdmin() && ( 
                <Button
                  color="inherit"
                  sx={{ mr: 2, "&:hover": { bgcolor: "primary.dark" } }}
                  startIcon={<DashboardIcon />}
                  // Always navigate to admin dashboard since only admins see this
                  onClick={() => navigate("/admin/dashboard")} 
                >
                  Dashboard
                </Button>
              )}
              {/* Conditionally render Add Article link for editors/admins */}
              {(isAdmin() || userIsEditor()) && (
                <Button
                  color="inherit"
                  sx={{ mr: 2, "&:hover": { bgcolor: "primary.dark" } }}
                  startIcon={<AddBoxIcon />} // Use the imported icon
                  onClick={() => navigate("/editor/add")}
                >
                  Add Article
                </Button>
              )}
              <Button
                color="inherit"
                sx={{ mr: 1, "&:hover": { bgcolor: "primary.dark" } }}
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                sx={{ mr: 1, "&:hover": { bgcolor: "primary.dark" } }}
                startIcon={<LoginIcon />}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate("/register")}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

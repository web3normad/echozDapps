import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from './context/WalletContext';


// Import Components
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./context/ThemeContext";

// Import Pages
import LandingPage from "./pages/Website/Home";
import MusicDashboard from "./pages/music/MusicDashboard";
import ExplorePage from "./pages/music/ExploreMusic";

import Subscription from "./pages/Subscription";
import UploadMusic from "./pages/artist/UploadMusic";
import UserDashboard from "./pages/User/UserDashboard";
import Artist from "./pages/artist/ArtistDashboard";




export default function App() {
  return (
    <WalletProvider>
            <ThemeProvider>
              <Router>
                <Routes>
                  {/* Landing Page */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Dashboard Pages with Sidebar and Navbar */}
                  <Route
                    path="/stream-music"
                    element={
                      <DashboardLayout>
                        <MusicDashboard />
                      </DashboardLayout>
                    }
                  />
                  {/* <Route
                    path="/search"
                    element={
                      <DashboardLayout>
                        <Search />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/likes"
                    element={
                      <DashboardLayout>
                        <Likes />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/playlists"
                    element={
                      <DashboardLayout>
                        <Playlists />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/albums"
                    element={
                      <DashboardLayout>
                        <Albums />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/following"
                    element={
                      <DashboardLayout>
                        <Following />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <DashboardLayout>
                        <Settings />
                      </DashboardLayout>
                    }
                  /> */}
                  <Route
                    path="/subscription"
                    element={
                      <DashboardLayout>
                        <Subscription />
                      </DashboardLayout>
                    }
                  />
                  {/* <Route
                    path="/logout"
                    element={
                      <DashboardLayout>
                        <Logout />
                      </DashboardLayout>
                    }
                  /> */}
                  <Route
                    path="/upload-music"
                    element={
                      <DashboardLayout>
                        <UploadMusic />
                      </DashboardLayout>
                    }
                  />
                  {/* <Route
                    path="/revenue"
                    element={
                      <DashboardLayout>
                        <Revenue />
                      </DashboardLayout>
                    }
                  /> */}
                  <Route
                    path="/user"
                    element={
                      <DashboardLayout>
                        <UserDashboard />
                      </DashboardLayout>
                    }
                  />
                  {/* <Route
                    path="/profile"
                    element={
                      <DashboardLayout>
                        <UserProfile />
                      </DashboardLayout>
                    }
                  /> */}
                  {/* <Route
                    path="/global-stream"
                    element={
                      <DashboardLayout>
                        <GlobalStreamRates />
                      </DashboardLayout>
                    }
                  /> */}
                  <Route
                    path="/explore-music"
                    element={
                      <DashboardLayout>
                        <ExplorePage />
                      </DashboardLayout>
                    }
                  />
                  <Route
                    path="/artist"
                    element={
                      <DashboardLayout>
                        <Artist />
                      </DashboardLayout>
                    }
                  />
                </Routes>
              </Router>
            </ThemeProvider>
            </WalletProvider>
  );
}

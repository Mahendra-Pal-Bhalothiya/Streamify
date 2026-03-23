// frontend/src/App.jsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LiveStreamPage from "./pages/LiveStreamPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import { useEffect, useState } from "react";
import streamChatService from "./lib/streamChatService";

const App = () => {
  const { isLoading, authUser, refetch } = useAuthUser();
  const { theme } = useThemeStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      console.log("🟣 App - token on init:", token ? "Present" : "Missing");

      if (token) {
        try {
          await refetch();
        } catch (error) {
          console.error("Failed to refetch user:", error);
          localStorage.removeItem("token");
        }
      }
      setIsInitialized(true);
    };

    initAuth();
  }, [refetch]);

  // Initialize Stream Chat when user is authenticated
  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      if (!authUser || !authUser.isOnboarded) {
        if (streamChatService.isInitialized()) {
          await streamChatService.disconnect();
          if (mounted) {
            setChatInitialized(false);
          }
        }
        return;
      }

      try {
        setChatError(null);

        const userForChat = {
          id:
            authUser._id?.toString() ||
            authUser.id?.toString() ||
            authUser.userId?.toString(),
          name:
            authUser.name ||
            authUser.username ||
            authUser.email?.split("@")[0] ||
            "User",
          image: authUser.avatar || authUser.profilePicture,
          email: authUser.email,
          metadata: {
            isOnboarded: authUser.isOnboarded,
            createdAt: authUser.createdAt,
            role: authUser.role,
          },
        };

        if (!userForChat.id) {
          throw new Error("User ID is missing. Cannot initialize chat.");
        }

        console.log("🟣 Initializing Stream Chat for user:", userForChat.id);

        await streamChatService.initialize(userForChat);

        if (mounted) {
          setChatInitialized(true);
          console.log("✅ Stream Chat initialized successfully");
        }
      } catch (error) {
        console.error("❌ Failed to initialize Stream Chat:", error);
        if (mounted) {
          setChatError(error.message);
          setChatInitialized(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  // Disconnect chat on logout
  useEffect(() => {
    if (!authUser && streamChatService.isInitialized()) {
      const disconnectChat = async () => {
        await streamChatService.disconnect();
        setChatInitialized(false);
        console.log("🔴 Stream Chat disconnected");
      };
      disconnectChat();
    }
  }, [authUser]);

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded ?? true;

  console.log("🟣 App - authUser:", authUser);
  console.log("🟣 App - isAuthenticated:", isAuthenticated);
  console.log("🟣 App - isOnboarded:", isOnboarded);
  console.log("🟣 App - isLoading:", isLoading);
  console.log("🟣 App - isInitialized:", isInitialized);
  console.log("🟣 App - chatInitialized:", chatInitialized);

  if (isLoading || !isInitialized) {
    return <PageLoader />;
  }

  return (
    <div className="h-screen" data-theme={theme}>
      <BrowserRouter>
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <HomePage chatInitialized={chatInitialized} />
                </Layout>
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <DashboardPage chatInitialized={chatInitialized} />
                </Layout>
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Login Route */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : isOnboarded ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />

          {/* Signup Route */}
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignUpPage />
              ) : isOnboarded ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            }
          />

          {/* Notifications Route */}
          <Route
            path="/notifications"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationsPage chatInitialized={chatInitialized} />
                </Layout>
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Friends Route */}
          <Route
            path="/friends"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <FriendsPage chatInitialized={chatInitialized} />
                </Layout>
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Live Stream Route */}
          <Route
            path="/live"
            element={
              isAuthenticated && isOnboarded ? (
                <LiveStreamPage />
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Call Route */}
          <Route
            path="/call/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <CallPage chatInitialized={chatInitialized} />
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Chat Route */}
          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage
                    chatInitialized={chatInitialized}
                    chatError={chatError}
                  />
                </Layout>
              ) : isAuthenticated && !isOnboarded ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            error: {
              duration: 6000,
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
};

export default App;

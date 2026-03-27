import React, { useState, useEffect } from "react";
import { Home, Search, Bell, Mail, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import HomeView from "./views/HomeView";
import ExploreView from "./views/ExploreView";
import MessageView from "./views/MessageView";
import ProfileView from "./views/ProfileView";
import ChatRoomView from "./views/ChatRoomView";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import PostDetailView from "./views/PostDetailView";
import NotificationsView from "./views/NotificationsView";
import SettingsView from "./views/SettingsView";
import SystemSettingsView from "./views/SystemSettingsView";
import CreatePostView from "./views/CreatePostView";
import EditProfileView from "./views/EditProfileView";
import { userApi, authApi } from "./services/api";
import { User as UserType, Chat as ChatType } from "./types";

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Auth init failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    navigate("/login");
  };

  const handleUpdateUser = async (updatedUser: UserType) => {
    try {
      const response = await userApi.updateProfile(
        updatedUser.bio || "",
        updatedUser.location || "",
        updatedUser.website || "",
        updatedUser.avatar,
      );
      setCurrentUser(response);
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  const publicPaths = ["/login", "/register"];
  const isPublicPath = publicPaths.includes(location.pathname);

  const hasNavbar =
    currentUser &&
    !isPublicPath &&
    ![
      "/chat",
      "/create-post",
      "/settings",
      "/edit-profile",
      "/system-settings",
    ].includes(location.pathname);

  const NavItem = ({
    icon: Icon,
    path,
  }: {
    icon: React.ElementType;
    path: string;
  }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-1 flex-col items-center justify-center py-3 transition-all active:scale-90 ${
        location.pathname === path
          ? "text-zinc-100"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <Icon
        className={`h-7 w-7 transition-transform ${
          location.pathname === path
            ? "scale-110 stroke-[2.5px]"
            : "stroke-[1.5px]"
        }`}
      />
    </button>
  );

  return (
    <div className="flex h-screen w-full justify-center bg-zinc-950 overflow-hidden">
      {/* 模拟手机容器 */}
      <div className="relative flex h-full w-full  flex-col border-x border-zinc-900 bg-black shadow-2xl overflow-hidden">
        {/* 内容滚动区域 */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-full"
              style={{ paddingBottom: hasNavbar ? "52px" : "0" }}
            >
              <Routes>
                <Route
                  path="/login"
                  element={
                    currentUser ? (
                      <Navigate to="/" />
                    ) : (
                      <LoginView onLogin={handleLogin} />
                    )
                  }
                />
                <Route
                  path="/register"
                  element={currentUser ? <Navigate to="/" /> : <RegisterView />}
                />
                <Route
                  path="/"
                  element={
                    currentUser ? (
                      <HomeView currentUser={currentUser} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/explore"
                  element={
                    currentUser ? (
                      <ExploreView currentUser={currentUser} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    currentUser ? (
                      <NotificationsView />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/messages"
                  element={
                    currentUser ? (
                      <MessageView
                        onSelectChat={(chat) => {
                          setActiveChat(chat);
                          navigate("/chat");
                        }}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/chat"
                  element={
                    currentUser && activeChat ? (
                      <ChatRoomView
                        chat={activeChat}
                        currentUser={currentUser}
                        onBack={() => navigate("/messages")}
                      />
                    ) : (
                      <Navigate to="/messages" />
                    )
                  }
                />
                <Route
                  path="/profile"
                  element={
                    currentUser ? (
                      <ProfileView
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        onSettings={() => navigate("/settings")}
                        onEditProfile={() => navigate("/edit-profile")}
                        onBack={() => navigate("/")}
                        onSelectChat={(chat) => {
                          setActiveChat(chat);
                          navigate("/chat");
                        }}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/profile/:id"
                  element={
                    currentUser ? (
                      <ProfileView
                        currentUser={currentUser}
                        onLogout={handleLogout}
                        onSettings={() => navigate("/settings")}
                        onEditProfile={() => navigate("/edit-profile")}
                        onBack={() => navigate(-1)}
                        onSelectChat={(chat) => {
                          setActiveChat(chat);
                          navigate("/chat");
                        }}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/edit-profile"
                  element={
                    currentUser ? (
                      <EditProfileView
                        user={currentUser}
                        onSave={handleUpdateUser}
                        onCancel={() => navigate("/profile")}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/settings"
                  element={
                    currentUser ? (
                      <SettingsView
                        onBack={() => navigate("/profile")}
                        onLogout={handleLogout}
                        onSystemSettings={() => navigate("/system-settings")}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/system-settings"
                  element={
                    currentUser ? (
                      <SystemSettingsView
                        onBack={() => navigate("/settings")}
                      />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/create-post"
                  element={
                    currentUser ? (
                      <CreatePostView onBack={() => navigate("/")} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
                <Route
                  path="/post/:id"
                  element={
                    currentUser ? (
                      <PostDetailView currentUser={currentUser} />
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 悬浮发布按钮 (仅在有 Navbar 时显示) */}
        {hasNavbar && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/create-post")}
            className="absolute bottom-40 right-5 z-50 rounded-full bg-sky-500 p-4 text-white shadow-lg shadow-sky-500/30 transition-transform active:bg-sky-600"
          >
            <Plus size={24} strokeWidth={3} />
          </motion.button>
        )}

        {/* 固定底部导航栏 */}
        {hasNavbar && (
          <nav className="fixed bottom-0 flex w-full items-center justify-around border-t border-zinc-900 bg-black/90 pb-[env(safe-area-inset-bottom,12px)] backdrop-blur-xl z-50">
            <NavItem icon={Home} path="/" />
            <NavItem icon={Search} path="/explore" />
            <NavItem icon={Bell} path="/notifications" />
            <NavItem icon={Mail} path="/messages" />
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-1 justify-center py-3"
            >
              <div
                className={`h-7 w-7 overflow-hidden rounded-full border-2 transition-all ${
                  location.pathname === "/profile"
                    ? "scale-110 border-sky-500"
                    : "border-transparent opacity-70"
                }`}
              >
                <img
                  src={currentUser?.avatar}
                  className="h-full w-full object-cover"
                  alt="avatar"
                />
              </div>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;

import React, { useState } from "react";
import { Home, Search, Bell, Mail, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HomeView from "./views/HomeView";
import ExploreView from "./views/ExploreView";
import MessageView from "./views/MessageView";
import ProfileView from "./views/ProfileView";
import ChatRoomView from "./views/ChatRoomView";
import AuthView from "./views/AuthView";
import NotificationsView from "./views/NotificationsView";
import SettingsView from "./views/SettingsView";
import SystemSettingsView from "./views/SystemSettingsView";
import CreatePostView from "./views/CreatePostView";
import EditProfileView from "./views/EditProfileView";
import { User as UserType, ViewState } from "./types";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>("AUTH");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    setCurrentView("HOME");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("AUTH");
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setCurrentUser(updatedUser);
    setCurrentView("PROFILE");
  };

  const renderView = () => {
    if (!currentUser && currentView !== "AUTH") {
      return <AuthView onLogin={handleLogin} />;
    }

    switch (currentView) {
      case "AUTH":
        return <AuthView onLogin={handleLogin} />;
      case "HOME":
        return <HomeView currentUser={currentUser!} />;
      case "EXPLORE":
        return <ExploreView />;
      case "NOTIFICATIONS":
        return <NotificationsView />;
      case "MESSAGES":
        return (
          <MessageView
            onSelectChat={(id) => {
              setActiveChatId(id);
              setCurrentView("CHAT");
            }}
          />
        );
      case "CHAT":
        return (
          <ChatRoomView
            chatId={activeChatId!}
            onBack={() => setCurrentView("MESSAGES")}
          />
        );
      case "PROFILE":
        return (
          <ProfileView
            user={currentUser!}
            onLogout={handleLogout}
            onSettings={() => setCurrentView("SETTINGS")}
            onEditProfile={() => setCurrentView("EDIT_PROFILE")}
            onBack={() => setCurrentView("HOME")}
          />
        );
      case "EDIT_PROFILE":
        return (
          <EditProfileView
            user={currentUser!}
            onSave={handleUpdateUser}
            onCancel={() => setCurrentView("PROFILE")}
          />
        );
      case "SETTINGS":
        return (
          <SettingsView
            onBack={() => setCurrentView("PROFILE")}
            onLogout={handleLogout}
            onSystemSettings={() => setCurrentView("SYSTEM_SETTINGS")}
          />
        );
      case "SYSTEM_SETTINGS":
        return <SystemSettingsView onBack={() => setCurrentView("SETTINGS")} />;
      case "CREATE_POST":
        return <CreatePostView onBack={() => setCurrentView("HOME")} />;
      default:
        return <HomeView currentUser={currentUser!} />;
    }
  };

  const hasNavbar =
    currentUser &&
    ![
      "AUTH",
      "CHAT",
      "CREATE_POST",
      "SETTINGS",
      "EDIT_PROFILE",
      "SYSTEM_SETTINGS",
    ].includes(currentView);

  const NavItem = ({ icon: Icon, view }: { icon: any; view: ViewState }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-1 flex-col items-center justify-center py-3 transition-all active:scale-90 ${
        currentView === view
          ? "text-zinc-100"
          : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <Icon
        className={`h-7 w-7 transition-transform ${
          currentView === view ? "scale-110 stroke-[2.5px]" : "stroke-[1.5px]"
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
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-h-full"
              style={{ paddingBottom: "52px" }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 悬浮发布按钮 (仅在有 Navbar 时显示) */}
        {hasNavbar && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView("CREATE_POST")}
            className="absolute bottom-20 right-5 z-50 rounded-full bg-sky-500 p-4 text-white shadow-lg shadow-sky-500/30 transition-transform active:bg-sky-600"
          >
            <Plus size={24} strokeWidth={3} />
          </motion.button>
        )}

        {/* 固定底部导航栏 */}
        {hasNavbar && (
          <nav className="fixed bottom-0 flex w-full items-center justify-around border-t border-zinc-900 bg-black/90 pb-[env(safe-area-inset-bottom,12px)] backdrop-blur-xl z-50">
            <NavItem icon={Home} view="HOME" />
            <NavItem icon={Search} view="EXPLORE" />
            <NavItem icon={Bell} view="NOTIFICATIONS" />
            <NavItem icon={Mail} view="MESSAGES" />
            <button
              onClick={() => setCurrentView("PROFILE")}
              className="flex flex-1 justify-center py-3"
            >
              <div
                className={`h-7 w-7 overflow-hidden rounded-full border-2 transition-all ${
                  currentView === "PROFILE"
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

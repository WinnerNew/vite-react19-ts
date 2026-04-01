import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  User as UserIcon,
  Repeat2,
  Settings,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../services/api";
import { Notification } from "../types";

const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data.items);
      await notificationApi.markAllAsRead();
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <Heart size={22} className="text-pink-600 fill-pink-600" />;
      case "FOLLOW":
        return <UserIcon size={22} className="text-sky-500 fill-sky-500" />;
      case "REPOST":
        return <Repeat2 size={22} className="text-green-500" />;
      case "REPLY":
        return <MessageCircle size={22} className="text-sky-500" />;
      default:
        return null;
    }
  };

  const getNotificationContent = (type: string) => {
    switch (type) {
      case "LIKE":
        return "liked your post";
      case "FOLLOW":
        return "followed you";
      case "REPOST":
        return "reposted your post";
      case "REPLY":
        return "replied to your post";
      default:
        return "";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleNotificationClick = (n: Notification) => {
    if (n.type === "FOLLOW") {
      navigate(`/profile/${n.actor.id}`);
    } else if (n.post) {
      navigate(`/post/${n.post.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-2 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
          <h2 className="text-xl font-extrabold tracking-tight">
            Notifications
          </h2>
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
        <div className="flex w-full">
          {["All", "Verified", "Mentions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 text-center relative hover:bg-zinc-900/50 transition-colors group"
            >
              <span
                className={`text-[14px] font-bold ${activeTab === tab ? "text-zinc-100" : "text-zinc-500"}`}
              >
                {tab}
              </span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-sky-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 flex gap-4 hover:bg-zinc-900/30 transition-colors cursor-pointer ${!n.read ? "bg-sky-500/5" : ""}`}
            >
              <div className="flex-shrink-0 pt-1">
                {renderNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <img
                    src={n.actor.avatar}
                    className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
                    alt="avatar"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${n.actor.id}`);
                    }}
                  />
                  <span className="text-xs text-zinc-500">
                    {formatTime(n.created_at)}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-zinc-100">
                  <span
                    className="font-bold hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${n.actor.id}`);
                    }}
                  >
                    {n.actor.username}
                  </span>{" "}
                  <span className="text-zinc-400">
                    {getNotificationContent(n.type)}
                  </span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center px-10">
            <h3 className="text-2xl font-bold mb-2">No notifications yet</h3>
            <p className="text-zinc-500 text-sm">
              When someone interacts with you or your posts, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;

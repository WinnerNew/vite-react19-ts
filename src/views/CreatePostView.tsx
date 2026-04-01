import React, { useState, useRef } from "react";
import { X, Image, List, MapPin, Globe, Smile, Loader2 } from "lucide-react";
import { postApi } from "../services/api";
import { useToast } from "../components/Toast";

interface CreatePostViewProps {
  onBack: () => void;
}

const CreatePostView: React.FC<CreatePostViewProps> = ({ onBack }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handlePost = async () => {
    if (!content.trim() && !image) return;

    setIsLoading(true);

    try {
      await postApi.createPost(content.trim(), image || undefined);
      onBack();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create post";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="flex items-center justify-between px-4 py-2 pt-[env(safe-area-inset-top,8px)]">
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X size={22} />
        </button>
        <button
          disabled={(!content.trim() && !image) || isLoading}
          onClick={handlePost}
          className={`bg-sky-500 text-white font-bold px-5 py-1.5 rounded-full transition-all ${
            (!content.trim() && !image) || isLoading
              ? "opacity-50"
              : "hover:bg-sky-600 active:scale-95"
          }`}
        >
          {isLoading ? "Posting..." : "Post"}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-3 px-4 pt-4">
          <div className="flex-shrink-0">
            <img
              src="https://picsum.photos/seed/me/200"
              className="w-10 h-10 rounded-full object-cover border border-zinc-800"
            />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <button className="self-start text-sky-500 border border-zinc-800 rounded-full px-3 py-0.5 text-[13px] font-bold hover:bg-sky-500/5 transition-colors mb-4">
              Everyone
            </button>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What is happening?!"
              className="bg-transparent border-none text-xl text-zinc-100 placeholder:text-zinc-600 outline-none resize-none w-full"
              rows={4}
            />

            {isUploading && (
              <div className="mt-2 flex items-center justify-center h-48 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <Loader2 className="animate-spin text-sky-500" size={32} />
              </div>
            )}

            {image && !isUploading && (
              <div className="mt-2 relative">
                <button
                  onClick={removeImage}
                  className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm z-10 transition-colors"
                >
                  <X size={18} />
                </button>
                <img
                  src={image}
                  className="w-full h-auto max-h-[400px] rounded-2xl object-cover border border-zinc-800 shadow-lg"
                  alt="post image"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 p-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))]">
        <button className="flex items-center gap-1.5 text-sky-500 text-[14px] font-bold mb-6 hover:bg-sky-500/5 px-2 py-1 rounded-full transition-colors -ml-1">
          <Globe size={16} />
          Everyone can reply
        </button>

        <div className="flex justify-between items-center text-sky-500">
          <div className="flex gap-4">
            <button
              onClick={handleImageClick}
              className="p-1 hover:bg-sky-500/10 rounded-full transition-colors"
            >
              <Image size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors">
              <List size={20} />
            </button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors">
              <Smile size={20} />
            </button>
            <button className="p-1 hover:bg-sky-500/10 rounded-full transition-colors">
              <MapPin size={20} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] ${content.length > 250 ? "text-pink-500 border-pink-500" : "text-zinc-500"}`}
            >
              {280 - content.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostView;

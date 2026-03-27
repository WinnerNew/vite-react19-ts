import React, { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { User } from "../types";

interface EditProfileViewProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  type?: "text" | "textarea";
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}) => (
  <div className="relative border border-zinc-800 rounded-lg p-2 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-all">
    <label className="block text-[13px] text-zinc-500 font-medium ml-1 mb-1">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full bg-transparent border-none text-[15px] text-zinc-100 outline-none resize-none placeholder:text-zinc-700"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-transparent border-none text-[15px] text-zinc-100 outline-none placeholder:text-zinc-700"
      />
    )}
    {maxLength && (
      <div className="absolute top-2 right-2 text-[11px] text-zinc-600">
        {value.length} / {maxLength}
      </div>
    )}
  </div>
);

const EditProfileView: React.FC<EditProfileViewProps> = ({
  user,
  onSave,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatar: user.avatar,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      ...user,
      username: formData.username,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      avatar: formData.avatar,
    });
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="sticky top-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 py-3 border-b border-zinc-900 pt-[env(safe-area-inset-top,8px)]">
        <div className="flex items-center gap-6">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-bold">Edit profile</h2>
        </div>
        <button
          onClick={handleSave}
          className="bg-white text-black text-[14px] font-bold px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
        >
          Save
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-10">
        <div className="relative h-32 bg-zinc-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80"
            className="w-full h-full object-cover opacity-60"
            alt="cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="p-3 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all backdrop-blur-sm">
              <Camera size={22} />
            </button>
          </div>

          <div className="absolute -bottom-10 left-4">
            <div
              onClick={handleAvatarClick}
              className="relative w-20 h-20 rounded-full border-4 border-black bg-zinc-900 overflow-hidden shadow-lg group cursor-pointer"
            >
              <img
                src={formData.avatar}
                className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                alt="profile"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-2 bg-black/40 rounded-full text-white backdrop-blur-sm group-hover:bg-black/60 transition-all">
                  {isUploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Camera size={20} />
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <div className="mt-14 px-4 space-y-6">
          <InputField
            label="Name"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Name"
            maxLength={50}
          />

          <InputField
            label="Bio"
            name="bio"
            type="textarea"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Add your bio"
            maxLength={160}
          />

          <InputField
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Add your location"
            maxLength={30}
          />

          <InputField
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="Add your website"
            maxLength={100}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfileView;

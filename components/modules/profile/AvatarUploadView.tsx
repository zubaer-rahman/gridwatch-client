"use client";

import {
  Camera,
  CheckCircle2,
  FileImage,
  RefreshCw,
  Shield,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCurrentUser } from "@/hooks/auth.hook";
import { useUploadAvatar } from "@/hooks/user.hook";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function AvatarUploadView() {
  const { user, avatar, role } = useCurrentUser();
  const uploadMutation = useUploadAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const roleColor =
    role === "ADMIN"
      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
      : role === "OPERATOR"
        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

  const handleFileSelect = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.add({
        title: "Unsupported File Format",
        description: "Please select a JPG, PNG, WEBP, or GIF image.",
        type: "error",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.add({
        title: "File Too Large",
        description: "Avatar image must be under 5 MB.",
        type: "error",
      });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleClearSelected = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      toast.add({
        title: "Avatar Updated",
        description: "Your new profile picture has been synchronized.",
        type: "success",
      });
      handleClearSelected();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to upload avatar image";
      toast.add({
        title: "Upload Failed",
        description: errorMsg,
        type: "error",
      });
    }
  };

  const currentDisplayAvatar = previewUrl || avatar;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Profile Avatar & Identity
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              ACCOUNT
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your personal profile picture and visual identity across
            GridWatch
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Current Profile Card */}
        <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-card ring-2 ring-border shadow-xl bg-muted flex items-center justify-center relative">
              {currentDisplayAvatar ? (
                <Image
                  src={currentDisplayAvatar}
                  alt={user?.email || "Avatar"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <User className="h-12 w-12 stroke-[1.5]" />
                  <span className="text-[10px] mt-1 font-mono uppercase">
                    No Avatar
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-amber-500 text-black shadow-lg hover:bg-amber-400 transition-transform active:scale-95 cursor-pointer ring-2 ring-card"
              title="Upload new avatar"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1 w-full">
            <h2 className="font-bold text-foreground text-base truncate">
              {user?.email?.split("@")[0] || "User Principal"}
            </h2>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {user?.email}
            </p>
          </div>

          <div className="pt-2 border-t border-border w-full flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border font-mono ${roleColor}`}
            >
              <Shield className="h-3.5 w-3.5" />
              {role || "USER"}
            </span>
          </div>

          <div className="text-[11px] text-muted-foreground/80 font-mono w-full text-center">
            User ID: {user?.userId?.slice(0, 12)}...
          </div>
        </div>

        {/* Right Column: Upload Zone & Actions */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Upload New Profile Picture
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a square photo or brand icon. Formats supported: JPEG,
                PNG, WebP, GIF (up to 5MB).
              </p>
            </div>

            {/* Hidden native input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={(e) => {
                if (e.target.value && e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {/* Drag and Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? "border-amber-500 bg-amber-500/5 ring-4 ring-amber-500/10 scale-[0.99]"
                  : "border-border hover:border-amber-500/50 hover:bg-muted/30"
              }`}
            >
              <div className="p-3.5 rounded-full bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-amber-500 font-semibold underline-offset-4 hover:underline">
                    Click to browse
                  </span>{" "}
                  or drag and drop your image here
                </p>
                <p className="text-xs text-muted-foreground">
                  High-resolution square images look best (1:1 ratio, min
                  256x256)
                </p>
              </div>
            </div>

            {/* Selected File Review & Action Bar */}
            {selectedFile && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in-0 duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadMutation.isPending}
                    onClick={handleClearSelected}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={uploadMutation.isPending}
                    onClick={handleConfirmUpload}
                    className="h-8 px-3 text-xs bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Spinner className="h-3.5 w-3.5 mr-1" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Save Avatar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Cloud Storage & Security Notice */}
          <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-foreground">
                Cloud CDN Synchronization
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Avatars are securely stored on Cloudinary CDN and linked with
                your GridWatch account (`/api/v1/users/me/avatar`). Changes
                reflect instantly across top-level headers and activity feeds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

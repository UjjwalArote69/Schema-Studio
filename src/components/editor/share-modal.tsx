/* eslint-disable react-hooks/set-state-in-effect */
// ============================================================
// FILE: src/components/editor/share-modal.tsx
//
// Modal for managing public schema sharing.
// Allows enabling/disabling sharing, copying the share URL,
// and regenerating the share token.
// ============================================================

"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  Loader2,
  Globe,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import {
  enableSharing,
  disableSharing,
  regenerateShareToken,
  getShareStatus,
} from "@/app/actions/share-actions";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ShareModal({ isOpen, onClose, projectId }: ShareModalProps) {
  const [isShared, setIsShared] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState<
    "enable" | "disable" | "regenerate" | null
  >(null);

  // Fetch current share status when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getShareStatus(projectId)
      .then(({ isShared, shareToken }) => {
        setIsShared(isShared);
        setShareToken(shareToken);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen, projectId]);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`
    : null;

  const handleEnable = useCallback(() => {
    setActionType("enable");
    startTransition(async () => {
      const result = await enableSharing(projectId);
      setShareToken(result.shareToken);
      setIsShared(true);
      setActionType(null);
    });
  }, [projectId]);

  const handleDisable = useCallback(() => {
    setActionType("disable");
    startTransition(async () => {
      await disableSharing(projectId);
      setShareToken(null);
      setIsShared(false);
      setActionType(null);
    });
  }, [projectId]);

  const handleRegenerate = useCallback(() => {
    setActionType("regenerate");
    startTransition(async () => {
      const result = await regenerateShareToken(projectId);
      setShareToken(result.shareToken);
      setActionType(null);
    });
  }, [projectId]);

  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-md p-4 transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
                Share Schema
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                Generate a public read-only link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : isShared && shareUrl ? (
            /* ── Sharing enabled state ── */
            <div className="space-y-5">
              {/* Status badge */}
              <div className="flex items-center gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Public link active
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/60 mt-0.5">
                    Anyone with this link can view your schema (read-only).
                  </p>
                </div>
              </div>

              {/* Share URL field */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                  Share Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono truncate">
                      {shareUrl}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400 dark:text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Open in new tab */}
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
              >
                <ExternalLink className="w-4 h-4" />
                Preview shared page
              </a>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                <button
                  onClick={handleRegenerate}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50"
                  title="Generate a new link (old link stops working)"
                >
                  {actionType === "regenerate" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  New Link
                </button>

                <div className="flex-1" />

                <button
                  onClick={handleDisable}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all disabled:opacity-50"
                >
                  {actionType === "disable" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                  Disable Sharing
                </button>
              </div>
            </div>
          ) : (
            /* ── Sharing disabled state ── */
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  Schema is private
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
                  Enable sharing to generate a public link. Anyone with the link
                  will be able to view your schema in read-only mode — they
                  cannot edit, delete, or access your account.
                </p>
              </div>

              <button
                onClick={handleEnable}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-md disabled:opacity-50"
              >
                {actionType === "enable" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                {actionType === "enable"
                  ? "Generating link..."
                  : "Enable Public Sharing"}
              </button>

              <p className="text-[11px] text-zinc-400 text-center">
                You can disable sharing at any time to revoke the link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
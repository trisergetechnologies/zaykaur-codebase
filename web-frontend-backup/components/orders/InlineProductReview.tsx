"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Star, Loader2, X } from "lucide-react";
import { apiPost, apiPostFormData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Props = {
  productId: string;
  orderId: string;
  enabled: boolean;
};

const MAX_IMAGES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif";

type Staged = { file: File; url: string };

export function InlineProductReview({ productId, orderId, enabled }: Props) {
  const [rating, setRating] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [body, setBody] = useState("");
  const [staged, setStaged] = useState<Staged[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stagedRef = useRef(staged);
  stagedRef.current = staged;

  useEffect(() => {
    return () => {
      stagedRef.current.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, []);

  if (!enabled) return null;

  const openFromStar = (value: number) => {
    setRating(value);
    setCommentOpen(true);
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    setStaged((prev) => {
      const next = [...prev];
      for (let i = 0; i < list.length && next.length < MAX_IMAGES; i++) {
        const file = list[i];
        const okType =
          file.type.startsWith("image/") ||
          /\.(heic|heif)$/i.test(file.name);
        if (!okType) {
          toast.error(`${file.name}: use a photo (JPEG, PNG, WebP, GIF, or HEIC)`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} is too large (max 5 MB)`);
          continue;
        }
        next.push({ file, url: URL.createObjectURL(file) });
      }
      if (list.length && next.length >= MAX_IMAGES && prev.length < MAX_IMAGES) {
        toast.info(`You can add up to ${MAX_IMAGES} photos`);
      }
      return next;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAt = (idx: number) => {
    setStaged((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  /**
   * Upload one file per request using the single-file endpoint. Next.js rewrites
   * sometimes mishandle multipart arrays; sequential `file` uploads are reliable.
   */
  const uploadReviewImages = async (files: File[]): Promise<{ url: string; alt: string }[]> => {
    if (files.length === 0) return [];
    const out: { url: string; alt: string }[] = [];
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      const res = await apiPostFormData<{ url: string }>(
        "/api/v1/upload?folder=reviews",
        fd
      );
      if (!res.success || !res.data || typeof res.data.url !== "string" || !res.data.url) {
        const hint =
          res.message?.includes("Not authorized") || res.message?.includes("token")
            ? " Please sign in again."
            : res.message?.includes("Cloudinary") || res.message?.includes("not configured")
              ? " Ask the admin to set Cloudinary in server .env."
              : "";
        throw new Error((res.message || `Could not upload ${f.name}`) + hint);
      }
      out.push({ url: res.data.url, alt: "" });
    }
    return out;
  };

  const submit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error("Pick a star rating");
      return;
    }
    setSubmitting(true);
    try {
      let images: { url: string; alt: string }[] = [];
      if (staged.length > 0) {
        try {
          images = await uploadReviewImages(staged.map((s) => s.file));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Upload failed";
          toast.error(msg);
          setSubmitting(false);
          return;
        }
      }

      const res = await apiPost("/api/v1/customer/reviews", {
        productId,
        orderId,
        rating,
        title: "",
        body: body.trim(),
        images,
      });
      if (res.success) {
        toast.success("Thanks for your review!");
        setDone(true);
        setCommentOpen(false);
        staged.forEach((s) => URL.revokeObjectURL(s.url));
        setStaged([]);
      } else {
        toast.error(res.message || "Could not submit review");
        if (res.message?.toLowerCase().includes("already reviewed")) {
          setDone(true);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <div className="flex items-center gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-4 w-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-600"}`}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Review submitted</span>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-700">
      <p className="mb-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">Rate this product</p>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => openFromStar(s)}
            className="rounded p-0.5 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 dark:hover:bg-amber-950/30"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            <Star
              className={`h-5 w-5 sm:h-6 sm:w-6 ${
                s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
              }`}
            />
          </button>
        ))}
      </div>
      {commentOpen && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Share a quick comment (optional)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="rounded-lg text-sm"
          />

          <div className="space-y-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              id={`review-photos-${productId}`}
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg border-dashed"
                disabled={staged.length >= MAX_IMAGES}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="mr-1.5 h-4 w-4" />
                Add photos
              </Button>
              <span className="text-xs text-slate-500">
                Optional · up to {MAX_IMAGES} · max 5 MB each
              </span>
            </div>
            {staged.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {staged.map((s, idx) => (
                  <li key={s.url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAt(idx)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="rounded-lg bg-pink-600 hover:bg-pink-700"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-lg"
              onClick={() => {
                setCommentOpen(false);
                setBody("");
                setStaged((prev) => {
                  prev.forEach((p) => URL.revokeObjectURL(p.url));
                  return [];
                });
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

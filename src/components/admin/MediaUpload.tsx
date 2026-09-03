import { useRef, useState } from 'react';
import { Upload, Loader2, Trash2, AlertCircle, Link2 } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

interface MediaUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Tailwind aspect class for the preview box. */
  aspectRatio?: string;
  /** Max file size in MB (default 8). */
  maxSizeMB?: number;
  hint?: string;
}

/**
 * Drag-and-drop image upload with inline preview, type/size validation and an
 * "or paste a URL" fallback. Uploads straight to Cloudinary via the shared
 * unsigned preset.
 */
export default function MediaUpload({
  label,
  value,
  onChange,
  aspectRatio = 'aspect-[16/9]',
  maxSizeMB = 8,
  hint,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB} MB.`);
      return;
    }
    setUploading(true);
    try {
      const res = await uploadToCloudinary(file);
      onChange(res.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>

      {value ? (
        <div className={`${aspectRatio} group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white p-2 text-neutral-700 hover:bg-neutral-100"
              title="Replace"
            >
              <Upload size={16} />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-lg bg-white p-2 text-red-500 hover:bg-red-50"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`${aspectRatio} flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors ${
            dragging
              ? 'border-amber-500 bg-amber-50'
              : 'border-neutral-200 hover:border-amber-400 hover:bg-amber-50/40'
          } ${uploading ? 'cursor-wait opacity-60' : ''}`}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin text-neutral-400" />
          ) : (
            <Upload size={22} className="text-neutral-400" />
          )}
          <p className="text-sm text-neutral-500">
            {uploading ? 'Uploading…' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-[11px] text-neutral-400">JPG / PNG / WEBP · max {maxSizeMB} MB</p>
        </div>
      )}

      {/* URL fallback */}
      <div className="mt-2 flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={() => urlDraft.trim() && (onChange(urlDraft.trim()), setUrlDraft(''))}
            placeholder="…or paste an image URL"
            className="w-full rounded-lg border border-neutral-200 py-1.5 pl-7 pr-3 text-xs focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {hint && <p className="mt-1 text-[11px] text-neutral-400">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

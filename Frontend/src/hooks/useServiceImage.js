import { useState, useEffect } from "react";
import { fetchProgramByTitle } from "../services/serviceService.js";
import { getDownloadUrl } from "../services/uploadService.js";

/**
 * useServiceImage(programTitle, localFallback?)
 *
 * Fetches a program from the DB by title, resolves its S3 imagekeys to a
 * presigned URL, and optionally resolves galleryImageKeys too.
 *
 * Returns:
 *   coverUrl    – presigned URL for the cover image (or localFallback while loading)
 *   galleryUrls – array of presigned URLs for gallery images
 *   loading     – true while fetching
 */
export function useServiceImage(programTitle, localFallback = null) {
    const [coverUrl, setCoverUrl] = useState(localFallback);
    const [galleryUrls, setGalleryUrls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!programTitle) { setLoading(false); return; }

        let cancelled = false;

        (async () => {
            try {
                const program = await fetchProgramByTitle(programTitle);
                if (cancelled) return;

                // Resolve cover image
                if (program?.imagekeys) {
                    const key = program.imagekeys;
                    const url = key.startsWith("http") ? key : await getDownloadUrl(key);
                    if (!cancelled) setCoverUrl(url);
                }

                // Resolve gallery images
                if (program?.galleryImageKeys?.length) {
                    const resolved = await Promise.all(
                        program.galleryImageKeys.map(async (key) => {
                            if (key.startsWith("http")) return key;
                            return getDownloadUrl(key).catch(() => null);
                        })
                    );
                    if (!cancelled) setGalleryUrls(resolved.filter(Boolean));
                }
            } catch {
                // Program might not be in DB yet — localFallback stays in place
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [programTitle]);

    return { coverUrl, galleryUrls, loading };
}

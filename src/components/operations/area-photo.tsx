import Image from "next/image";
import photos from "@/content/area-photos.json";
import { placeName } from "@/i18n/geography";

export default function AreaPhoto({
  name,
  locale,
}: {
  name: string;
  locale: string;
}) {
  const key = placeName(name, "en") as keyof typeof photos;
  const photo = photos[key];
  const bn = locale === "bn";
  if (!photo)
    return (
      <Image
        src="/service-area.svg"
        alt={bn ? "ডেলিভারি এলাকার চিত্র" : "Delivery area illustration"}
        width={800}
        height={500}
        className="area-photo-image"
      />
    );
  const caption = bn ? photo.captionBn : photo.caption;
  return (
    <figure className="area-photo">
      <Image
        src={photo.src}
        alt={caption}
        width={800}
        height={500}
        sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 400px"
        className="area-photo-image"
      />
      <figcaption>
        <span>{caption}</span>
        <details className="area-photo-credit">
          <summary>{bn ? "ছবির স্বীকৃতি" : "Photo credit"}</summary>
          <p>
            <a href={photo.source} target="_blank" rel="noopener noreferrer">
              {photo.author}
            </a>{" "}
            ·{" "}
            <a
              href={photo.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {photo.license}
            </a>{" "}
            · {bn ? "আকার ও ফরম্যাট পরিবর্তিত" : "Resized / WebP"}
          </p>
        </details>
      </figcaption>
    </figure>
  );
}

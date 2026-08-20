// app/components/banners/BannerDisplay.tsx

interface BannerImage {
  url: string;
  alt_text?: string;
  position: number;
}

interface BannerButton {
  text: string;
  url: string;
  color: string;
  text_color: string;
  position: number;
}

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  background_color: string;
  background_gradient?: string;
  text_color: string;
  images: BannerImage[];
  buttons: BannerButton[];
}

interface BannerDisplayProps {
  banner: Banner;
}

export default function BannerDisplay({ banner }: BannerDisplayProps) {
  const hasImages = banner.images && banner.images.length > 0;

  const backgroundStyle = banner.background_gradient
    ? { background: banner.background_gradient }
    : { backgroundColor: banner.background_color };

  return (
    <div
      role="banner"
      aria-label={banner.title}
      className="w-full overflow-hidden rounded-lg"
      style={{
        ...backgroundStyle,
        color: banner.text_color,
      }}
    >
      <div
        className={`max-w-6xl mx-auto ${hasImages && banner.images.length === 1 ? "px-0" : "px-4 sm:px-6 lg:px-2"}`}
      >
        <div
          className={`flex flex-col ${
            hasImages
              ? "lg:flex-row lg:items-center lg:gap-6"
              : "items-center text-center"
          } ${hasImages && banner.images.length === 1 ? "pt-3 lg:py-0" : "py-4 sm:py-5 lg:py-4"}`}
        >
          {/* Content Section */}
          <div
            className={`${hasImages ? "lg:w-1/2 flex flex-col justify-center items-center text-center px-2" : "max-w-2xl mx-auto text-center"} space-y-1.5`}
          >
            {" "}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-sm sm:text-base font-medium opacity-90 leading-snug">
                {banner.subtitle}
              </p>
            )}
            {banner.description && (
              <p className="text-xs sm:text-sm opacity-80 leading-relaxed line-clamp-2">
                {banner.description}
              </p>
            )}
            {banner.buttons && banner.buttons.length > 0 && (
              <div
                className={`flex flex-wrap gap-3 pt-1 ${!hasImages ? "justify-center" : ""}`}
              >
                {banner.buttons
                  .sort((a, b) => a.position - b.position)
                  .map((button, index) => (
                    <a
                      key={index}
                      role="button"
                      aria-label={`${button.text} - ${banner.title}`}
                      href={button.url}
                      className="inline-block px-5 py-3 rounded-md font-semibold text-xs sm:text-sm transition-all"
                      style={{
                        backgroundColor: button.color,
                        color: button.text_color,
                      }}
                    >
                      {button.text}
                    </a>
                  ))}
              </div>
            )}
          </div>

          {/* Images Section */}
          {hasImages && (
            <div className="mt-4 lg:mt-0 lg:w-1/2 lg:max-w-md lg:ml-auto">
              <div
                className={`grid gap-2 ${
                  banner.images.length === 1
                    ? "grid-cols-1"
                    : banner.images.length === 2
                      ? "grid-cols-2"
                      : banner.images.length === 3
                        ? "grid-cols-3"
                        : "grid-cols-2"
                }`}
              >
                {banner.images
                  .sort((a, b) => a.position - b.position)
                  .map((image, index) => (
                    <div
                      key={index}
                      className={`relative w-full overflow-hidden ${banner.images.length === 1 ? "" : "rounded-md"}`}
                      style={{
                        aspectRatio:
                          banner.images.length === 1 ? "16/9" : "4/3",
                        maxHeight:
                          banner.images.length === 1 ? "200px" : "150px",
                      }}
                    >
                      <img
                        src={image.url}
                        alt={
                          image.alt_text ||
                          `${banner.title} promotional image ${index + 1}`
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

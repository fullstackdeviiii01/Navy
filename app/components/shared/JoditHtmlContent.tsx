// app/components/shared/JoditHtmlContent.tsx
import React from 'react';

interface JoditHtmlContentProps {
  content: string;
  className?: string;
  containerClassName?: string;
}

const JoditHtmlContent: React.FC<JoditHtmlContentProps> = ({ 
  content, 
  className = '',
  containerClassName = ''
}) => {
  if (!content) {
    return null;
  }

  return (
    <div className={`w-full overflow-x-auto ${containerClassName}`}>
      <div 
        className={`
          prose dark:prose-invert 
          prose-headings:font-bold 
          prose-h1:text-3xl 
          prose-h2:text-2xl 
          prose-h3:text-xl 
          prose-h4:text-lg 
          prose-h5:text-base 
          prose-h6:text-sm 
          max-w-none 
          post-content
          ${className}
        `}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default JoditHtmlContent;
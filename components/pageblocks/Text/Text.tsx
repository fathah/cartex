import React from "react";

interface TextProps {
  content: string;
  backgroundColor?: string;
}

const Text: React.FC<TextProps> = ({ content, backgroundColor }) => {
  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto px-6">
        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br />") }}
        />
      </div>
    </section>
  );
};

export default Text;

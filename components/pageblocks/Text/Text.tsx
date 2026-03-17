import React from "react";

interface TextProps {
  content: string;
}

const Text: React.FC<TextProps> = ({ content }) => {
  return (
    <section className="py-20 bg-white">
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

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface TextProps {
  content: string;
  backgroundColor?: string;
}

const Text: React.FC<TextProps> = ({ content, backgroundColor }) => {
  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
};

export default Text;

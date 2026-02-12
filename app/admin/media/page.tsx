import React from "react";
import prisma from "@/db/prisma";
import MediaList from "./media-list";
import MediaUpload from "./media-upload";

const MediaIndex = async () => {
  const media = await prisma.media.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-500">{media.length} items</span>
          <MediaUpload />
        </div>
      </div>
      <MediaList data={media} />
    </div>
  );
};

export default MediaIndex;

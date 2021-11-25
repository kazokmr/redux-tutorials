import path from "path";
import fs from "fs";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), 'posts');

const getSortedPostsData = () => {

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map(fileName => {

    const id = fileName.replace(/\.md$/, "");

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const matterResult = matter(fileContents);

    return {
      id,
      ...matterResult.data
    };
  });

  return allPostsData.sort(({date: a}, {date: b}) => b.localeCompare(a));
};

export default getSortedPostsData;
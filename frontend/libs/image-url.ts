const imageBaseUrl = "https://gateway.pinata.cloud/ipfs/";

// 拼接图片基础路径
export function addImageBaseUrl(image: string) {
  return `${imageBaseUrl}${image}`;
}

// 裁剪基础路径
export function trimImageBaseUrl(image: string) {
  return image.replace(imageBaseUrl, "");
}

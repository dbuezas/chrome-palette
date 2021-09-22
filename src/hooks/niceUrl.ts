export default function niceUrl(url: string) {
  return url.length <= 80 ? url : url.slice(0, 40) + "..." + url.slice(-37);
}

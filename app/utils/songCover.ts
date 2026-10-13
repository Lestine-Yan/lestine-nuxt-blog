import type { SongListItem } from '~/types/margaret'

/**
 * 歌曲生效封面：cover_url（本地覆盖）|| embedded_cover_url（音频内嵌抽取），最后回退本地唱片占位图
 */
export function songCover(song?: Pick<SongListItem, 'cover_url' | 'embedded_cover_url'> | null): string {
  return song?.cover_url || song?.embedded_cover_url || '/images/svg/disc.svg'
}

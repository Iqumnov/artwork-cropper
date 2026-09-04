/** Shared wall-view overlay UI — warm grey + subtle dark shadow from ourdynasty */
export const WALL_GREY_COLOR = '#3c2d2e'

export const WALL_BLACK_SHADOW = '0 1px 3px rgba(15, 11, 12, 0.6)'

/** Exact filter for #3c2d2e with a #faf8f8 shadow */
export const WALL_ICON_FILTER =
  'invert(16%) sepia(12%) saturate(996%) hue-rotate(309deg) brightness(97%) contrast(93%) drop-shadow(0 1px 1px #faf8f8)'

export const wallIconImageStyle = {
  filter: WALL_ICON_FILTER,
} as const

export const wallTextStyle = {
  color: WALL_GREY_COLOR,
  textShadow: WALL_BLACK_SHADOW,
} as const

export const WALL_SLIDER_TRACK_FILL = '#3c2d2e'
export const WALL_SLIDER_TRACK_REST = 'rgba(163, 158, 150, 0.38)'
export const WALL_SLIDER_THUMB = '#3c2d2e'

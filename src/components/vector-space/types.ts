export interface VectorPoint {
  img_name: string
  x: number
  y: number
  id: string
}

export interface ClusterPoint {
  id: string
  x: number
  y: number
  radius: number
  count: number
  points: VectorPoint[]
  isCluster: true
}

export interface ViewTransform {
  x: number
  y: number
  k: number
}

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DuplicateCheck } from '@/types/api'
import { NEARBY_RADIUS_METERS } from '@/lib/constants'

export function useDuplicateCheck(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['nearby-reports', lat, lng],
    queryFn: () =>
      api.get<DuplicateCheck[]>(
        `/reports/nearby?lat=${lat}&lng=${lng}&radius_m=${NEARBY_RADIUS_METERS}`,
      ),
    enabled: lat !== null && lng !== null,
    staleTime: 30_000,
    retry: false,
  })
}

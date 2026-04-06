import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '../../api/bookings.api'
import { useAuthStore } from '../../stores/authStore'

export function useBookings() {
  const { isAuthenticated } = useAuthStore()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getMyBookings().then((r) => r.data.data),
    enabled: isAuthenticated,
  })

  return { bookings: bookings || [], isLoading }
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

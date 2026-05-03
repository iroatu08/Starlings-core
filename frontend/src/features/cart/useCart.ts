import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../../api/cart.api'
import type { AddCartItemPayload, UpdateCartItemPayload } from '../../api/cart.api'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { useEffect } from 'react'

export function useCart() {
  const { isAuthenticated } = useAuthStore()
  const { setItems, openDrawer } = useCartStore()
  const queryClient = useQueryClient()

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart().then((r) => r.data.data),
    enabled: isAuthenticated,
  })

  useEffect(() => {
    if (cartData?.items) setItems(cartData.items)
  }, [cartData, setItems])

  const addItemMutation = useMutation({
    mutationFn: (payload: AddCartItemPayload) =>
      cartApi.addItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      openDrawer()
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, ...payload }: { itemId: string } & UpdateCartItemPayload) =>
      cartApi.updateItem(itemId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  const totalAmount = cartData?.items?.reduce(
    (sum, item) => sum + Number(item.unitPriceNgn) * item.quantity, 0
  ) || 0

  const totalItems = cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const isCartMutating =
    updateItemMutation.isPending || removeItemMutation.isPending || clearCartMutation.isPending

  return {
    cart: cartData,
    isLoading,
    totalAmount,
    totalItems,
    addItem: addItemMutation.mutateAsync,
    isAddingItem: addItemMutation.isPending,
    isCartMutating,
    updateItem: updateItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
  }
}

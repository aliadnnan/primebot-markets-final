'use server'

import { supabaseServer, isUserAdmin, updateOrderStatus } from '@/lib/supabase/server'
import {
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
} from '@/lib/email'

export async function verifyAdminAccess(userId: string) {
  try {
    const isAdmin = await isUserAdmin(userId)
    
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    return { success: true, isAdmin: true }
  } catch (error) {
    console.error('Error verifying admin access:', error)
    throw error
  }
}

export async function getAdminOrders(userId: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    // Get all orders
    const { data, error } = await supabaseServer
      .from('orders')
      .select(`
        *,
        users:user_id(id, email, full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      orders: data,
    }
  } catch (error) {
    console.error('Error getting admin orders:', error)
    throw error
  }
}

export async function getAdminOrdersByStatus(userId: string, status: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    const validStatuses = ['pending_verification', 'verified', 'rejected', 'delivered']
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status')
    }

    // Get orders by status
    const { data, error } = await supabaseServer
      .from('orders')
      .select(`
        *,
        users:user_id(id, email, full_name)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      orders: data,
    }
  } catch (error) {
    console.error('Error getting orders by status:', error)
    throw error
  }
}

export async function searchAdminOrders(userId: string, searchTerm: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required')
    }

    // Search orders by ID, customer name, or email
    const { data, error } = await supabaseServer
      .from('orders')
      .select(`
        *,
        users:user_id(id, email, full_name)
      `)
      .or(
        `id.ilike.%${searchTerm}%,
         bot_name.ilike.%${searchTerm}%,
         transaction_id.ilike.%${searchTerm}%`
      )
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      orders: data,
    }
  } catch (error) {
    console.error('Error searching orders:', error)
    throw error
  }
}

export async function approveOrderPayment(userId: string, orderId: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    // Get order first to get customer email
    const { data: orderData, error: orderError } = await (supabaseServer as any)
      .from('orders')
      .select('*, users:user_id(id, email, full_name)')
      .eq('id', orderId)
      .single()

    if (orderError) {
      throw orderError
    }

    if (!orderData) {
      throw new Error('Order not found')
    }

    // Update order status to verified
    const { error: updateError } = await (supabaseServer as any)
      .from('orders')
      .update({
        status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    // Send approval email to customer
    try {
      const user = Array.isArray((orderData as any).users) ? (orderData as any).users[0] : (orderData as any).users
      if (user) {
        await sendPaymentApprovedEmail(
          user.email,
          user.full_name || 'Customer',
          orderId,
          (orderData as any).bot_name
        )
      }
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return {
      success: true,
      message: 'Order approved',
    }
  } catch (error) {
    console.error('Error approving order payment:', error)
    throw error
  }
}

export async function rejectOrderPayment(
  userId: string,
  orderId: string,
  rejectionReason: string
) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new Error('Rejection reason is required')
    }

    // Get order first to get customer email
    const { data: orderData, error: orderError } = await (supabaseServer as any)
      .from('orders')
      .select('*, users:user_id(id, email, full_name)')
      .eq('id', orderId)
      .single()

    if (orderError) {
      throw orderError
    }

    if (!orderData) {
      throw new Error('Order not found')
    }

    // Update order status with rejection reason
    const { error: updateError } = await (supabaseServer as any)
      .from('orders')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      throw updateError
    }

    // Send rejection email to customer
    try {
      const user = Array.isArray((orderData as any).users) ? (orderData as any).users[0] : (orderData as any).users
      if (user) {
        await sendPaymentRejectedEmail(
          user.email,
          user.full_name || 'Customer',
          orderId,
          (orderData as any).bot_name,
          rejectionReason
        )
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
      // Don't fail the rejection if email fails
    }

    return {
      success: true,
      message: 'Order rejected',
    }
  } catch (error) {
    console.error('Error rejecting order payment:', error)
    throw error
  }
}

export async function markOrderAsDelivered(userId: string, orderId: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    // Update order status
    await updateOrderStatus(orderId, 'delivered')

    return {
      success: true,
      message: 'Order marked as delivered',
    }
  } catch (error) {
    console.error('Error marking order as delivered:', error)
    throw error
  }
}

export async function getAdminStats(userId: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    // Get statistics
    const { data: allOrders, error: ordersError } = await (supabaseServer as any)
      .from('orders')
      .select('status')

    if (ordersError) {
      throw ordersError
    }

    const stats = {
      total: allOrders?.length || 0,
      pending: allOrders?.filter((o: any) => o.status === 'pending_verification').length || 0,
      verified: allOrders?.filter((o: any) => o.status === 'verified').length || 0,
      rejected: allOrders?.filter((o: any) => o.status === 'rejected').length || 0,
      delivered: allOrders?.filter((o: any) => o.status === 'delivered').length || 0,
    }

    // Get total revenue
    const { data: verifiedOrders, error: revenueError } = await (supabaseServer as any)
      .from('orders')
      .select('bot_price')
      .eq('status', 'verified')

    if (!revenueError && verifiedOrders) {
      const totalRevenue = verifiedOrders.reduce((sum, order) => sum + (order.bot_price || 0), 0)
      ;(stats as any).totalRevenue = totalRevenue
    }

    return {
      success: true,
      stats,
    }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    throw error
  }
}

export async function getAllAdminUsers(userId: string) {
  try {
    // Verify admin access
    await verifyAdminAccess(userId)

    // Get all users
    const { data, error } = await (supabaseServer as any)
      .from('users')
      .select('id, email, full_name, created_at, is_admin')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      success: true,
      users: data,
    }
  } catch (error) {
    console.error('Error getting users:', error)
    throw error
  }
}

import { Client, Environment } from "square"
import { randomUUID } from "crypto"
import dotenv from "dotenv"
import { join } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { logger } from '../helpers/logger.js';
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../../.env') })

// Fix for BigInt serialization
if (typeof BigInt !== "undefined") {
  (BigInt.prototype).toJSON = function () {
    return this.toString()
  }
}

let squareClient = null

// Initialize Square client
export function getSquareClient() {
  if (!squareClient) {
    squareClient = new Client({
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
      environment: process.env.ENV === "prod" ? Environment.Production : Environment.Sandbox,
    })
  }
  return squareClient
}

// create a customer
export async function createCustomer(customerInfo) {
  const { customersApi } = getSquareClient()

  // Create new customer
  try {
    const { result: customerResult } = await customersApi.createCustomer({
      idempotencyKey: randomUUID(),
      givenName: customerInfo?.firstName,
      familyName: customerInfo?.lastName,
      emailAddress: customerInfo?.email,
      phoneNumber: customerInfo?.phone,
    })

    const customerId = customerResult.customer?.id

    if (!customerId) {
      throw new Error("Failed to create customer")
    }

    return customerId
  } catch (error) {
    logger.error("Error creating customer:", error)
    throw new Error("Failed to create customer")
  }
}

// Create a card for a customer
export async function createCard(sourceId, customerId, customerInfo) {
  const { cardsApi } = getSquareClient()

  try {
    const { result: cardResult } = await cardsApi.createCard({
      idempotencyKey: randomUUID(),
      sourceId,
      card: {
        cardholderName: `${customerInfo?.firstName} ${customerInfo?.lastName}`,
        customerId,
      },
    })

    const cardId = cardResult.card?.id
    if (!cardId) {
      throw new Error("Failed to create payment card")
    }

    return cardId
  } catch (error) {
    logger.error("Error creating card:", error)
    
    // Extract Square API error details
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      const squareError = error.errors[0]

      // Handle specific error categories
      switch (squareError.category) {
        
        case 'AUTHENTICATION_ERROR':
          throw new Error("Payment service authentication error. Please try again later.")
        
        case 'INVALID_REQUEST_ERROR':
          // Handle card validation errors
          if (squareError.code === 'VERIFY_CVV_FAILURE') {
            throw new Error("Card verification failed. Please check your CVV and try again.")
          } else if (squareError.code === 'VERIFY_AVS_FAILURE') {
            throw new Error("Address verification failed. Please check your billing address.")
          } else if (squareError.code === 'CARD_DECLINED') {
            throw new Error("Your card was declined. Please try another payment method.")
          } else if (squareError.code === 'CARD_EXPIRED') {
            throw new Error("Your card has expired. Please use a different card.")
          } else if (squareError.code === 'INVALID_EXPIRATION') {
            throw new Error("Invalid expiration date. Please check and try again.")
          } else if (squareError.code === 'INVALID_CARD') {
            throw new Error("Invalid card information. Please check your card details.")
          } else if (squareError.code === 'INVALID_CARD_DATA') {
            throw new Error("Invalid card data. Please check and try again.")
          } else {
            throw new Error(`Card validation error: ${squareError.detail || 'Please check your card information.'}`)
          }
        
        case 'RATE_LIMIT_ERROR':
          throw new Error("Too many payment requests. Please try again in a few moments.")
        
        case 'PAYMENT_METHOD_ERROR':
          throw new Error("Payment method error: " + (squareError.detail || "Please try another payment method."))
        
        case 'RESOURCE_NOT_FOUND':
          throw new Error("Customer profile not found. Please contact support.")
          
        case 'BANK_ACCOUNT_ERROR':
          throw new Error("There was an issue with your bank account. Please try another payment method.")
          
        default:
          // If we have a detail message from Square, use it
          if (squareError.detail) {
            throw new Error(`Payment error: ${squareError.detail}`)
          }
          break
      }
    }
    
    throw new Error("We couldn't process your payment. Please try again or use a different payment method.")
  }
}

// Create a subscription
export async function createSubscription(customerId, cardId, planId) {
  const { subscriptionsApi } = getSquareClient()

  if (!planId) {
    throw new Error("Invalid plan selected")
  }

  try {
    const { result: subscriptionResult } = await subscriptionsApi.createSubscription({
      idempotencyKey: randomUUID(),
      locationId: process.env.LOCATION_ID,
      customerId,
      cardId,
      planId,
      startDate: new Date().toISOString().split("T")[0], // Start today
    })

    if (!subscriptionResult.subscription) {
      throw new Error("Failed to create subscription")
    }

    return subscriptionResult.subscription
  } catch (error) {
    logger.error("Error creating subscription:", error)
    throw new Error("Failed to create subscription")
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId) {
  const { subscriptionsApi } = getSquareClient()

  try {
    const { result } = await subscriptionsApi.cancelSubscription(subscriptionId)
    return result.subscription
  } catch (error) {
    logger.error("Error canceling subscription:", error)
    throw new Error("Failed to cancel subscription")
  }
}

// Upgrade a subscription plan
export async function upgradeSubscription(customerId, subscriptionId, planId) {
  const { subscriptionsApi } = getSquareClient()

  try {
    const { result: currentSubscription } = await subscriptionsApi.retrieveSubscription(subscriptionId)

    if (!currentSubscription.subscription) {
      throw new Error("Subscription not found")
    }

    const cardId = currentSubscription.subscription.cardId

    if (!cardId) {
      throw new Error("No card found for the subscription")
    }

    if (!planId) {
      throw new Error("Invalid plan selected")
    }

    // Cancel the current subscription
    if (!currentSubscription.subscription.canceledDate) {
      const canceledSubscription = await cancelSubscription(subscriptionId)

      if (!canceledSubscription) {
        throw new Error("Failed to cancel subscription")
      }
    }

    // Create a new subscription
    const newSubscription = await createSubscription(customerId, cardId, planId)

    if (!newSubscription) {
      throw new Error("Failed to create subscription")
    }

    return newSubscription
  } catch (error) {
    logger.error("Error updating subscription:", error)
    throw new Error("Failed to update subscription")
  }
}

// Get user subscriptions
export async function getUserSubscriptions(customerId) {
  const { subscriptionsApi } = getSquareClient()

  try {
    const { result } = await subscriptionsApi.searchSubscriptions({
      query: {
        filter: {
          customerIds: [customerId],
        },
      },
    })

    return result.subscriptions || []
  } catch (error) {
    logger.error("Error getting user subscriptions:", error)
    throw new Error("Failed to get user subscriptions")
  }
}

// Get Plans catalog details
export async function getPlansCatalogDetails(planId) {
  const { catalogApi } = getSquareClient()
  const { result } = await catalogApi.retrieveCatalogObject(planId)
  return result.object
}

